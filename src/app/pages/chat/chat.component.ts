import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/services';
import { AuthService } from '../../services/auth.service';
import { Message, User } from '../../models/models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-comments"></i> Chat</h1>
      <p class="page-subtitle">Real-time messaging with farmers, buyers & workers</p>
    </div>

    <div class="chat-layout">
      <!-- Conversations List -->
      <div class="conversations-panel card">
        <div class="conv-header">
          <strong>Conversations</strong>
        </div>
        <div class="conv-search">
          <input class="form-control" [(ngModel)]="searchQuery" placeholder="🔍 Search users..." (ngModelChange)="searchUsers()">
        </div>

        <!-- Search Results -->
        <div *ngIf="searchQuery && searchResults.length > 0" class="search-results">
          <div *ngFor="let u of searchResults" class="conv-item" (click)="startChat(u)">
            <div class="conv-avatar">{{ u.name[0].toUpperCase() }}</div>
            <div class="conv-info">
              <div class="conv-name">{{ u.name }}</div>
              <div class="conv-role">{{ formatRole(u.role) }}</div>
            </div>
          </div>
        </div>

        <!-- Existing Conversations -->
        <div *ngIf="!searchQuery">
          <div *ngFor="let conv of conversations" class="conv-item"
               [class.active]="selectedUser?.id === conv.userId"
               (click)="selectConversation(conv)">
            <div class="conv-avatar" [class.online]="conv.isOnline">{{ conv.userName[0].toUpperCase() }}</div>
            <div class="conv-info">
              <div class="conv-name">{{ conv.userName }}</div>
              <div class="conv-last">{{ conv.lastMessage | slice:0:35 }}{{ conv.lastMessage?.length > 35 ? '...' : '' }}</div>
            </div>
            <span class="conv-badge" *ngIf="conv.unread > 0">{{ conv.unread }}</span>
          </div>
          <div class="empty-conv" *ngIf="conversations.length === 0">
            <i class="fas fa-comments"></i>
            <p>No conversations yet.<br>Search for a user to start chatting.</p>
          </div>
        </div>
      </div>

      <!-- Chat Window -->
      <div class="chat-window card">
        <!-- No Selection -->
        <div class="no-chat" *ngIf="!selectedUser">
          <i class="fas fa-comments" style="font-size:3rem;color:rgba(30,138,44,0.15);margin-bottom:16px"></i>
          <h3>Select a conversation</h3>
          <p>Choose someone to start chatting</p>
        </div>

        <!-- Chat Active -->
        <ng-container *ngIf="selectedUser">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-header-user">
              <div class="conv-avatar">{{ selectedUser.name[0].toUpperCase() }}</div>
              <div>
                <div class="chat-user-name">{{ selectedUser.name }}</div>
                <div class="chat-user-role">{{ formatRole(selectedUser.role) }}</div>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" (click)="clearChat()">
              <i class="fas fa-arrow-left"></i> Back
            </button>
          </div>

          <!-- Messages -->
          <div class="messages-container" #messagesContainer>
            <div *ngFor="let msg of messages" class="message-wrapper"
                 [class.sent]="msg.senderId === currentUser?.id"
                 [class.received]="msg.senderId !== currentUser?.id">
              <div class="message-bubble">
                <div class="message-text">{{ msg.message }}</div>
                <div class="message-time">{{ msg.createdAt | date:'shortTime' }}</div>
              </div>
            </div>
            <div *ngIf="messages.length === 0" class="empty-messages">
              <p>Start the conversation with {{ selectedUser.name }}!</p>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input-bar">
            <input class="form-control" [(ngModel)]="newMessage"
                   placeholder="Type a message..."
                   (keyup.enter)="sendMessage()"
                   [disabled]="sending">
            <button class="btn btn-primary" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .chat-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 20px;
      height: calc(100vh - 180px);
    }
    @media (max-width: 768px) { .chat-layout { grid-template-columns: 1fr; height: auto; } }

    .conversations-panel { padding: 0; overflow-y: auto; display: flex; flex-direction: column; }
    .conv-header { padding: 16px; border-bottom: 1px solid rgba(30,138,44,0.15); font-size: 0.95rem; }
    .conv-search { padding: 12px; border-bottom: 1px solid rgba(30,138,44,0.15); }
    .conv-search .form-control { margin: 0; }

    .conv-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; cursor: pointer; border-bottom: 1px solid rgba(39,168,54,0.04);
      transition: background 0.15s; position: relative;
    }
    .conv-item:hover { background: rgba(39,168,54,0.04); }
    .conv-item.active { background: var(--g-500); }

    .conv-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--g-600); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.95rem; flex-shrink: 0; position: relative;
    }
    .conv-avatar.online::after {
      content: ''; position: absolute; bottom: 1px; right: 1px;
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--success); border: 2px solid #fff;
    }
    .conv-info { flex: 1; min-width: 0; }
    .conv-name { font-weight: 600; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .conv-last { font-size: 0.75rem; color: #6b8f70; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .conv-role { font-size: 0.75rem; color: #6b8f70; }
    .conv-badge {
      background: var(--g-600); color: #fff;
      border-radius: 50%; width: 20px; height: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 700; flex-shrink: 0;
    }

    .search-results { padding: 8px 0; }
    .empty-conv { text-align: center; padding: 32px 16px; color: #6b8f70; font-size: 0.85rem; }
    .empty-conv i { font-size: 2rem; display: block; margin-bottom: 12px; opacity: 0.3; }

    /* Chat Window */
    .chat-window { padding: 0; display: flex; flex-direction: column; overflow: hidden; }
    .no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6b8f70; text-align: center; }

    .chat-header {
      padding: 14px 20px; border-bottom: 1px solid rgba(30,138,44,0.15);
      display: flex; align-items: center; justify-content: space-between;
      background: #fff;
    }
    .chat-header-user { display: flex; align-items: center; gap: 12px; }
    .chat-user-name { font-weight: 700; font-size: 0.95rem; }
    .chat-user-role { font-size: 0.75rem; color: #6b8f70; }

    .messages-container {
      flex: 1; overflow-y: auto; padding: 20px;
      display: flex; flex-direction: column; gap: 8px;
      background: #fafffe;
    }
    .empty-messages { text-align: center; color: #6b8f70; font-size: 0.85rem; padding: 24px; margin: auto; }

    .message-wrapper { display: flex; }
    .message-wrapper.sent { justify-content: flex-end; }
    .message-wrapper.received { justify-content: flex-start; }

    .message-bubble {
      max-width: 65%; padding: 10px 14px; border-radius: 16px;
    }
    .sent .message-bubble { background: var(--g-600); color: #fff; border-bottom-right-radius: 4px; }
    .received .message-bubble { background: #fff; border: 1px solid rgba(30,138,44,0.15); border-bottom-left-radius: 4px; }
    .message-text { font-size: 0.875rem; line-height: 1.5; }
    .message-time { font-size: 0.7rem; opacity: 0.7; margin-top: 4px; text-align: right; }

    .chat-input-bar {
      display: flex; gap: 12px; padding: 16px 20px;
      border-top: 1px solid rgba(30,138,44,0.15); background: #fff;
    }
    .chat-input-bar .form-control { flex: 1; margin: 0; }
    .chat-input-bar .btn { flex-shrink: 0; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private msgContainer!: ElementRef;

  currentUser: User | null = null;
  selectedUser: User | null = null;
  conversations: any[] = [];
  messages: Message[] = [];
  searchQuery = '';
  searchResults: User[] = [];
  newMessage = '';
  sending = false;
  private pollSub?: Subscription;
  private shouldScroll = false;

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.loadConversations();
    this.pollSub = interval(5000).subscribe(() => {
      this.loadConversations();
      if (this.selectedUser) this.loadMessages(this.selectedUser.id, false);
    });
  }

  ngOnDestroy() { this.pollSub?.unsubscribe(); }

  ngAfterViewChecked() {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  loadConversations() {
    this.chatService.getConversations().subscribe(c => this.conversations = c);
  }

  selectConversation(conv: any) {
    this.selectedUser = { id: conv.userId, name: conv.userName, role: conv.userRole, email: '' } as User;
    this.searchQuery = '';
    this.loadMessages(conv.userId, true);
  }

  startChat(user: User) {
    this.selectedUser = user;
    this.searchQuery = '';
    this.searchResults = [];
    this.loadMessages(user.id, true);
  }

  loadMessages(userId: number, scroll: boolean) {
    this.chatService.getMessages(userId).subscribe(msgs => {
      this.messages = msgs;
      if (scroll) this.shouldScroll = true;
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser || this.sending) return;
    const msg = this.newMessage.trim();
    this.newMessage = '';
    this.sending = true;
    this.chatService.sendMessage(this.selectedUser.id, msg).subscribe({
      next: () => {
        this.sending = false;
        this.loadMessages(this.selectedUser!.id, true);
        this.loadConversations();
      },
      error: () => { this.sending = false; this.newMessage = msg; }
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) { this.searchResults = []; return; }
    this.authService.searchUsers(this.searchQuery).subscribe(u => this.searchResults = u);
  }

  clearChat() { this.selectedUser = null; this.messages = []; }

  formatRole(role: string): string {
    const m: any = { farmer: 'Farmer', buyer: 'Buyer', vehicle_owner: 'Vehicle Owner', manpower: 'Manpower' };
    return m[role] || role;
  }

  private scrollToBottom() {
    try { const el = this.msgContainer?.nativeElement; if (el) el.scrollTop = el.scrollHeight; } catch {}
  }
}
