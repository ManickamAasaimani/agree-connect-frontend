import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/services';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wa-shell">

      <!-- LEFT: Conversation list -->
      <div class="wa-left" [class.hidden-mobile]="!!selectedUser">

        <!-- Header -->
        <div class="wa-left-header">
          <div class="wa-my-avatar">{{ myInitial }}</div>
          <span class="wa-title">Chats</span>
          <div class="wa-header-icons">
            <i class="fas fa-search wa-icon-btn" (click)="showSearch = !showSearch"></i>
          </div>
        </div>

        <!-- Search bar -->
        <div class="wa-search-bar" *ngIf="showSearch">
          <div class="wa-search-wrap">
            <i class="fas fa-search wa-search-icon"></i>
            <input class="wa-search-input" [(ngModel)]="searchQuery"
                   placeholder="Search or start new chat"
                   (ngModelChange)="searchUsers()">
            <i class="fas fa-times wa-search-clear" *ngIf="searchQuery" (click)="clearSearch()"></i>
          </div>
        </div>

        <!-- Search results -->
        <div class="wa-convo-list" *ngIf="searchQuery && searchResults.length > 0">
          <div class="wa-section-label">SEARCH RESULTS</div>
          <div class="wa-convo-item" *ngFor="let u of searchResults" (click)="startChat(u)">
            <div class="wa-avatar wa-avatar-green">{{ u.name[0].toUpperCase() }}</div>
            <div class="wa-convo-body">
              <div class="wa-convo-name">{{ u.name }}</div>
              <div class="wa-convo-preview">{{ formatRole(u.role) }}</div>
            </div>
          </div>
        </div>

        <!-- No search results -->
        <div class="wa-no-results" *ngIf="searchQuery && searchResults.length === 0">
          <i class="fas fa-user-slash"></i>
          <p>No users found</p>
        </div>

        <!-- Conversation list -->
        <div class="wa-convo-list" *ngIf="!searchQuery">
          <div class="wa-convo-item"
               *ngFor="let conv of conversations"
               [class.active]="selectedUser?.id === conv.userId"
               (click)="selectConversation(conv)">
            <div class="wa-avatar wa-avatar-green">{{ conv.userName[0].toUpperCase() }}</div>
            <div class="wa-convo-body">
              <div class="wa-convo-top">
                <span class="wa-convo-name">{{ conv.userName }}</span>
                <span class="wa-convo-time">{{ conv.lastTime }}</span>
              </div>
              <div class="wa-convo-bottom">
                <span class="wa-convo-preview">{{ conv.lastMessage | slice:0:40 }}</span>
                <span class="wa-unread-badge" *ngIf="conv.unread > 0">{{ conv.unread }}</span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div class="wa-empty-list" *ngIf="conversations.length === 0">
            <div class="wa-empty-icon"><i class="fas fa-comment-dots"></i></div>
            <p>No conversations yet</p>
            <span>Tap the search icon to find someone</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Chat window -->
      <div class="wa-right" [class.hidden-mobile]="!selectedUser">

        <!-- No chat selected -->
        <div class="wa-welcome" *ngIf="!selectedUser">
          <div class="wa-welcome-icon"><i class="fas fa-comments"></i></div>
          <h2>AgriConnect Chat</h2>
          <p>Select a conversation or search for a farmer, buyer or worker to start messaging.</p>
        </div>

        <!-- Active chat -->
        <ng-container *ngIf="selectedUser">

          <!-- Chat header -->
          <div class="wa-chat-header">
            <button class="wa-back-btn" (click)="clearChat()">
              <i class="fas fa-arrow-left"></i>
            </button>
            <div class="wa-avatar wa-avatar-green">{{ selectedUser.name[0].toUpperCase() }}</div>
            <div class="wa-chat-info">
              <div class="wa-chat-name">{{ selectedUser.name }}</div>
              <div class="wa-chat-role">{{ formatRole(selectedUser.role) }}</div>
            </div>
          </div>

          <!-- Messages area -->
          <div class="wa-messages" #messagesContainer>


            <div *ngIf="messages.length === 0" class="wa-no-messages">
              <i class="fas fa-lock"></i>
              Messages are end-to-end secured.
              Say hi to {{ selectedUser.name }}!
            </div>

            <div *ngFor="let msg of messages; let i = index">

              <!-- Date separator -->
              <div class="wa-date-chip" *ngIf="showDateSep(msg, i)">
                {{ getDateLabel(msg.createdAt) }}
              </div>

              <!-- SENT bubble (right, green) -->
              <div class="wa-msg-row wa-sent" *ngIf="isSent(msg)">
                <div class="wa-bubble wa-bubble-sent">
                  <div class="wa-msg-text">{{ msg.message }}</div>
                  <div class="wa-msg-footer">
                    <span class="wa-msg-time">{{ formatTime(msg.createdAt) }}</span>
                    <span class="wa-ticks">
                      <i class="fas fa-check-double" [class.wa-tick-blue]="msg.isRead"></i>
                    </span>
                  </div>
                </div>
              </div>

              <!-- RECEIVED bubble (left, white) -->
              <div class="wa-msg-row wa-received" *ngIf="!isSent(msg)">
                <div class="wa-bubble wa-bubble-received">
                  <div class="wa-msg-text">{{ msg.message }}</div>
                  <div class="wa-msg-footer">
                    <span class="wa-msg-time">{{ formatTime(msg.createdAt) }}</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Typing indicator (when sending) -->
            <div class="wa-msg-row wa-received" *ngIf="sending">
              <div class="wa-bubble wa-bubble-received wa-typing">
                <span></span><span></span><span></span>
              </div>
            </div>

          </div>

          <!-- Input bar -->
          <div class="wa-input-bar">
            <div class="wa-input-wrap">
              <input class="wa-input"
                     [(ngModel)]="newMessage"
                     placeholder="Type a message"
                     (keyup.enter)="sendMessage()"
                     [disabled]="sending">
            </div>
            <button class="wa-send-btn"
                    (click)="sendMessage()"
                    [disabled]="!newMessage.trim() || sending"
                    [class.wa-send-active]="newMessage.trim()">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>

        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    /* Shell */
    :host { display: block; height: calc(100vh - 130px); }

    .wa-shell {
      display: grid;
      grid-template-columns: 360px 1fr;
      height: 100%;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(0,0,0,0.13);
      border: 1px solid rgba(0,0,0,0.08);
    }

    /* ---- LEFT PANEL ---- */
    .wa-left {
      display: flex;
      flex-direction: column;
      background: #fff;
      border-right: 1px solid #e9edef;
      height: 100%;
      overflow: hidden;
    }

    .wa-left-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: #f0f2f5;
      flex-shrink: 0;
    }
    .wa-title { flex: 1; font-size: 1.1rem; font-weight: 700; color: #111b21; }
    .wa-header-icons { display: flex; gap: 8px; }
    .wa-icon-btn {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #54656f; font-size: 0.95rem;
      transition: background 0.15s;
    }
    .wa-icon-btn:hover { background: #e9edef; }

    .wa-my-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: #25d366; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem; flex-shrink: 0;
    }

    /* Search bar */
    .wa-search-bar { padding: 8px 12px; background: #fff; flex-shrink: 0; }
    .wa-search-wrap {
      display: flex; align-items: center; gap: 10px;
      background: #f0f2f5; border-radius: 8px; padding: 8px 12px;
    }
    .wa-search-icon { color: #54656f; font-size: 0.85rem; }
    .wa-search-input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.875rem; color: #111b21; }
    .wa-search-input::placeholder { color: #8696a0; }
    .wa-search-clear { color: #54656f; cursor: pointer; font-size: 0.85rem; }

    /* Conversation list */
    .wa-convo-list { flex: 1; overflow-y: auto; }
    .wa-section-label {
      padding: 8px 18px; font-size: 0.7rem; font-weight: 700;
      color: #8696a0; letter-spacing: 0.08em;
    }

    .wa-convo-item {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 18px; cursor: pointer;
      border-bottom: 1px solid #f0f2f5;
      transition: background 0.12s;
    }
    .wa-convo-item:hover { background: #f5f6f6; }
    .wa-convo-item.active { background: #e9edef; }

    .wa-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.1rem; color: #fff; flex-shrink: 0;
    }
    .wa-avatar-green { background: #25d366; }

    .wa-convo-body { flex: 1; min-width: 0; }
    .wa-convo-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; }
    .wa-convo-name { font-size: 0.9rem; font-weight: 600; color: #111b21; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .wa-convo-time { font-size: 0.7rem; color: #8696a0; flex-shrink: 0; margin-left: 8px; }
    .wa-convo-bottom { display: flex; justify-content: space-between; align-items: center; }
    .wa-convo-preview { font-size: 0.8rem; color: #667781; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
    .wa-unread-badge {
      background: #25d366; color: #fff; border-radius: 50%;
      min-width: 20px; height: 20px; padding: 0 5px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.68rem; font-weight: 700; flex-shrink: 0; margin-left: 6px;
    }

    .wa-empty-list { text-align: center; padding: 48px 24px; color: #8696a0; }
    .wa-empty-icon { font-size: 3rem; margin-bottom: 12px; opacity: 0.3; }
    .wa-empty-list p { font-size: 0.9rem; font-weight: 600; color: #111b21; margin-bottom: 4px; }
    .wa-empty-list span { font-size: 0.8rem; }

    .wa-no-results { text-align: center; padding: 32px; color: #8696a0; }
    .wa-no-results i { font-size: 2rem; display: block; margin-bottom: 8px; opacity: 0.3; }
    .wa-no-results p { font-size: 0.85rem; }

    /* ---- RIGHT PANEL ---- */
    .wa-right {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: #efeae2;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c4b9aa' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    /* Welcome screen */
    .wa-welcome {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      color: #54656f; text-align: center; padding: 40px;
    }
    .wa-welcome-icon {
      width: 80px; height: 80px; border-radius: 50%;
      background: #25d366; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; margin-bottom: 20px;
    }
    .wa-welcome h2 { font-size: 1.3rem; font-weight: 300; color: #41525d; margin-bottom: 8px; }
    .wa-welcome p { font-size: 0.85rem; color: #8696a0; max-width: 300px; line-height: 1.6; }

    /* Chat header */
    .wa-chat-header {
      display: flex; align-items: center; gap: 14px;
      padding: 10px 18px;
      background: #f0f2f5;
      flex-shrink: 0;
      border-bottom: 1px solid #e9edef;
    }
    .wa-back-btn {
      background: none; border: none; cursor: pointer;
      color: #54656f; font-size: 1rem; padding: 4px 8px;
      border-radius: 50%; transition: background 0.15s;
    }
    .wa-back-btn:hover { background: #e9edef; }
    .wa-chat-info { flex: 1; }
    .wa-chat-name { font-size: 0.95rem; font-weight: 700; color: #111b21; }
    .wa-chat-role { font-size: 0.73rem; color: #667781; }

    /* Messages */
    .wa-messages {
      flex: 1; overflow-y: auto; padding: 16px 60px;
      display: flex; flex-direction: column; gap: 2px;
    }

    .wa-date-chip {
      text-align: center; margin: 12px auto;
      background: rgba(255,255,255,0.85);
      color: #54656f; font-size: 0.72rem; font-weight: 600;
      padding: 4px 12px; border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      display: inline-block; align-self: center;
    }

    .wa-no-messages {
      text-align: center; padding: 20px 32px;
      background: rgba(255,255,255,0.75);
      border-radius: 12px; font-size: 0.78rem;
      color: #54656f; align-self: center; margin: auto;
      box-shadow: 0 1px 2px rgba(0,0,0,0.07);
      line-height: 1.8;
    }
    .wa-no-messages i { margin-right: 5px; }

    /* Message rows */
    .wa-msg-row {
      display: flex; margin-bottom: 4px;
    }
    .wa-sent     { justify-content: flex-end; }
    .wa-received { justify-content: flex-start; }

    /* Bubbles */
    .wa-bubble {
      max-width: 62%; padding: 7px 12px 6px;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.13);
      position: relative; word-break: break-word;
    }

    /* Sent bubble -- WhatsApp green */
    .wa-bubble-sent {
      background: #d9fdd3;
      border-top-right-radius: 0;
    }
    .wa-bubble-sent::after {
      content: '';
      position: absolute; top: 0; right: -8px;
      border: 8px solid transparent;
      border-top-color: #d9fdd3;
      border-right: none;
    }

    /* Received bubble -- white */
    .wa-bubble-received {
      background: #fff;
      border-top-left-radius: 0;
    }
    .wa-bubble-received::after {
      content: '';
      position: absolute; top: 0; left: -8px;
      border: 8px solid transparent;
      border-top-color: #fff;
      border-left: none;
    }

    .wa-msg-text { font-size: 0.875rem; color: #111b21; line-height: 1.5; }

    .wa-msg-footer {
      display: flex; align-items: center; justify-content: flex-end;
      gap: 4px; margin-top: 2px;
    }
    .wa-msg-time { font-size: 0.68rem; color: #667781; }
    .wa-ticks { font-size: 0.72rem; color: #8696a0; }
    .wa-tick-blue { color: #53bdeb !important; }

    /* Typing indicator */
    .wa-typing {
      display: flex; align-items: center; gap: 4px;
      padding: 12px 16px;
    }
    .wa-typing span {
      width: 8px; height: 8px; border-radius: 50%;
      background: #8696a0; display: inline-block;
      animation: wa-bounce 1.2s infinite ease-in-out;
    }
    .wa-typing span:nth-child(2) { animation-delay: 0.2s; }
    .wa-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes wa-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* Input bar */
    .wa-input-bar {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px;
      background: #f0f2f5;
      flex-shrink: 0;
    }
    .wa-input-wrap {
      flex: 1; background: #fff; border-radius: 24px;
      padding: 10px 18px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    }
    .wa-input {
      width: 100%; border: none; outline: none;
      font-size: 0.9rem; color: #111b21; background: transparent;
      font-family: inherit;
    }
    .wa-input::placeholder { color: #8696a0; }

    .wa-send-btn {
      width: 48px; height: 48px; border-radius: 50%;
      border: none; cursor: pointer;
      background: #8696a0; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; transition: all 0.2s; flex-shrink: 0;
    }
    .wa-send-btn.wa-send-active { background: #25d366; }
    .wa-send-btn:hover.wa-send-active { background: #20c45a; transform: scale(1.06); }
    .wa-send-btn:disabled { opacity: 0.5; cursor: default; transform: none; }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .wa-shell { grid-template-columns: 1fr; }
      .hidden-mobile { display: none !important; }
      .wa-messages { padding: 12px 12px; }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private msgContainer!: ElementRef;

  myId: number = 0;
  myInitial: string = '?';
  currentUser: User | null = null;
  selectedUser: User | null = null;
  conversations: any[] = [];
  messages: any[] = [];
  searchQuery = '';
  searchResults: User[] = [];
  newMessage = '';
  sending = false;
  showSearch = false;
  private pollSub?: Subscription;
  private shouldScroll = false;

  constructor(private chatService: ChatService, private authService: AuthService) {
    const u = this.authService.currentUser;
    if (u) {
      this.myId = Number(u.id);
      this.currentUser = u;
      this.myInitial = u.name ? u.name[0].toUpperCase() : '?';
    }
  }

  ngOnInit() {
    // Always refresh from server so myId is guaranteed correct
    this.authService.getMe().subscribe({
      next: (u: any) => {
        this.myId = Number(u.id);
        this.currentUser = u;
        this.myInitial = u.name ? u.name[0].toUpperCase() : '?';
      },
      error: () => {}
    });
    this.loadConversations();
    this.pollSub = interval(3000).subscribe(() => {
      this.loadConversations();
      if (this.selectedUser) { this.loadMessages(Number(this.selectedUser.id), false); }
    });
  }

  ngOnDestroy() { this.pollSub?.unsubscribe(); }

  ngAfterViewChecked() {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (list: any[]) => {
        this.conversations = list.map((c: any) => ({
          ...c,
          lastTime: c.lastMessage ? this.formatTime(c.lastCreatedAt || '') : ''
        }));
      },
      error: () => {}
    });
  }

  selectConversation(conv: any) {
    this.selectedUser = { id: Number(conv.userId), name: conv.userName, role: conv.userRole, email: '' } as User;
    this.searchQuery = '';
    this.showSearch = false;
    this.loadMessages(Number(conv.userId), true);
  }

  startChat(user: User) {
    this.selectedUser = user;
    this.clearSearch();
    this.loadMessages(Number(user.id), true);
  }

  loadMessages(userId: number, scroll: boolean) {
    this.chatService.getMessages(userId).subscribe({
      next: (msgs: any[]) => {
        this.messages = msgs.map((m: any) => ({
          ...m,
          senderId:   Number(m.senderId),
          receiverId: Number(m.receiverId)
        }));
        if (scroll) { this.shouldScroll = true; }
      },
      error: (err: any) => { console.error('loadMessages error', err); }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser || this.sending) { return; }
    const text = this.newMessage.trim();
    this.newMessage = '';
    this.sending = true;

    // Optimistic bubble -- shows immediately on sender side
    const temp: any = {
      id: -Date.now(),
      senderId:   this.myId,
      receiverId: Number(this.selectedUser.id),
      message:    text,
      isRead:     false,
      createdAt:  new Date().toISOString()
    };
    this.messages = [...this.messages, temp];
    this.shouldScroll = true;

    this.chatService.sendMessage(this.selectedUser.id, text).subscribe({
      next: () => {
        this.sending = false;
        this.loadMessages(Number(this.selectedUser!.id), true);
        this.loadConversations();
      },
      error: () => {
        this.sending = false;
        this.newMessage = text;
        this.messages = this.messages.filter((m: any) => m.id !== temp.id);
      }
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) { this.searchResults = []; return; }
    this.authService.searchUsers(this.searchQuery).subscribe({
      next: (u: User[]) => this.searchResults = u,
      error: () => {}
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearch = false;
  }

  clearChat() { this.selectedUser = null; this.messages = []; }

  isSent(msg: any): boolean {
    if (!this.myId || this.myId === 0) { return false; }
    return Number(msg.senderId) === Number(this.myId);
  }

  showDateSep(msg: any, index: number): boolean {
    if (index === 0) { return true; }
    const prev = this.messages[index - 1];
    return this.getDateLabel(msg.createdAt) !== this.getDateLabel(prev.createdAt);
  }

  getDateLabel(createdAt: string): string {
    if (!createdAt) { return 'Today'; }
    try {
      // Java LocalDateTime comes as "2026-03-04T10:18:00" -- no Z suffix
      // Add Z only if no timezone info present so it parses as local time
      const raw = createdAt.includes('T') && !createdAt.includes('+') && !createdAt.endsWith('Z')
                  ? createdAt + 'Z' : createdAt;
      const d = new Date(raw);
      if (isNaN(d.getTime())) { return 'Today'; }
      const now = new Date();
      const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const msgStr   = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const diff = Math.floor((todayStr - msgStr) / 86400000);
      if (diff === 0) { return 'Today'; }
      if (diff === 1) { return 'Yesterday'; }
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return 'Today'; }
  }

  formatTime(createdAt: string): string {
    if (!createdAt) { return ''; }
    try {
      return new Date(createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  formatRole(role: string): string {
    const m: any = { farmer: 'Farmer', buyer: 'Buyer', vehicle_owner: 'Vehicle Owner', manpower: 'Manpower' };
    return m[role] || role;
  }

  private scrollToBottom() {
    try {
      const el = this.msgContainer?.nativeElement;
      if (el) { el.scrollTop = el.scrollHeight; }
    } catch { /* ignore */ }
  }}