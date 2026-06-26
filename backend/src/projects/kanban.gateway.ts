import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';
import { ActiveUser } from '../auth/types/active-user.interface';
import { Ticket } from '@prisma/client';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user: ActiveUser;
  };
}

export interface TicketCreatedPayload {
  projectId: string;
  columnId: string;
  ticket: Ticket;
}

export interface TicketDeletedPayload {
  projectId: string;
  columnId: string;
  ticketId: string;
}

export interface TicketUpdatedPayload {
  projectId: string;
  columnId: string;
  ticketId: string;
  updates: {
    title?: string;
    description?: string | null;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface TicketAssignedPayload {
  projectId: string;
  columnId: string;
  ticketId: string;
  assigneeId: string | null;
  assignee?: { id: string; name: string };
}

export interface ColumnMovedPayload {
  projectId: string;
  columnId: string;
  oldIndex: number;
  newIndex: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(KanbanGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const authHeaderToken =
        client.handshake.headers.authorization?.split(' ')[1];
      const token = (client.handshake.auth?.token as string) || authHeaderToken;

      if (!token) {
        throw new Error('Token JWT manquant');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      this.logger.log(
        `Accès autorisé : Client ${client.id} (User: ${client.data.user.email})`,
      );
    } catch (error) {
      this.logger.warn(
        `Rejet (Non authentifié) : ${error instanceof Error ? error.message : 'Inconnu'}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Déconnexion : ${client.id}`);
  }

  @SubscribeMessage('join_project')
  handleJoinProject(
    @MessageBody('projectId') projectId: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const roomName = `project:${projectId}`;

    client.join(roomName);
    this.logger.log(
      `L'utilisateur ${client.data.user.email} a rejoint le salon ${roomName}`,
    );

    return { event: 'joined', room: roomName };
  }

  @SubscribeMessage('move_ticket')
  handleMoveTicket(
    @MessageBody()
    payload: {
      projectId: string;
      ticketId: string;
      newColumnId: string;
      newPosition: number;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const roomName = `project:${payload.projectId}`;

    client.broadcast.to(roomName).emit('ticket_moved', payload);

    this.logger.log(
      `Synchronisation : Ticket ${payload.ticketId} déplacé par ${client.data.user.email}`,
    );
  }

  @SubscribeMessage('create_ticket')
  handleCreateTicket(
    @MessageBody() payload: TicketCreatedPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const roomName = `project:${payload.projectId}`;

    client.broadcast.to(roomName).emit('ticket_created', payload);

    this.logger.log(
      `Synchronisation : Nouveau ticket créé par ${client.data.user.email} dans la colonne ${payload.columnId}`,
    );
  }

  @SubscribeMessage('delete_ticket')
  handleDeleteTicket(
    @MessageBody() payload: TicketDeletedPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const roomName = `project:${payload.projectId}`;
    client.broadcast.to(roomName).emit('ticket_deleted', payload);
    this.logger.log(
      `Sync : Ticket ${payload.ticketId} supprimé par ${client.data.user.email}`,
    );
  }

  @SubscribeMessage('update_ticket')
  handleUpdateTicket(
    @MessageBody() payload: TicketUpdatedPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const roomName = `project:${payload.projectId}`;
    client.broadcast.to(roomName).emit('ticket_updated', payload);
    this.logger.log(
      `Sync : Ticket ${payload.ticketId} modifié par ${client.data.user.email}`,
    );
  }

  @SubscribeMessage('assign_ticket')
  handleAssignTicket(
    @MessageBody() payload: TicketAssignedPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const roomName = `project:${payload.projectId}`;
    client.broadcast.to(roomName).emit('ticket_assigned', payload);
    this.logger.log(
      `Sync : Ticket ${payload.ticketId} assigné par ${client.data.user.email}`,
    );
  }

  @SubscribeMessage('move_column')
  handleMoveColumn(
    @MessageBody() payload: ColumnMovedPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const roomName = `project:${payload.projectId}`;
    client.broadcast.to(roomName).emit('column_moved', payload);
    this.logger.log(
      `Synchronisation : Colonne ${payload.columnId} déplacée par ${client.data.user.email}`,
    );
  }
}
