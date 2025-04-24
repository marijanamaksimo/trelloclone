/**
 * Task Board Pilot - A simple Trello clone in vanilla JavaScript
 * Implements:
 * - Board creation, editing and deletion
 * - Lists management within boards
 * - Card management within lists
 * - Drag and drop functionality for cards
 * - Data persistence using localStorage
 */

// Data structure and storage management
const BoardManager = {
    boards: [],
    activeBoardId: null,
    activeListId: null,
    activeCardId: null,
    isEditMode: false,
  
    // Load data from localStorage on initialization
    init() {
      const storedBoards = localStorage.getItem('taskBoardPilot-boards');
      if (storedBoards) {
        this.boards = JSON.parse(storedBoards);
      }
      this.render();
    },
  
    // Save current state to localStorage
    save() {
      localStorage.setItem('taskBoardPilot-boards', JSON.stringify(this.boards));
    },
  
    // Board CRUD operations
    createBoard(name) {
      const newBoard = {
        id: Date.now().toString(),
        name: name,
        lists: []
      };
      this.boards.push(newBoard);
      this.save();
      this.render();
    },
  
    getBoard(boardId) {
      return this.boards.find(board => board.id === boardId);
    },
  
    updateBoard(boardId, name) {
      const board = this.getBoard(boardId);
      if (board) {
        board.name = name;
        this.save();
        this.renderBoard();
      }
    },
  
    deleteBoard(boardId) {
      this.boards = this.boards.filter(board => board.id !== boardId);
      this.save();
      this.render();
    },
  
    // List CRUD operations
    createList(boardId, name) {
      const board = this.getBoard(boardId);
      if (board) {
        const newList = {
          id: Date.now().toString(),
          name: name,
          cards: []
        };
        board.lists.push(newList);
        this.save();
        this.renderBoard();
      }
    },
  
    getList(boardId, listId) {
      const board = this.getBoard(boardId);
      if (board) {
        return board.lists.find(list => list.id === listId);
      }
      return null;
    },
  
    updateList(boardId, listId, name) {
      const list = this.getList(boardId, listId);
      if (list) {
        list.name = name;
        this.save();
        this.renderBoard();
      }
    },
  
    deleteList(boardId, listId) {
      const board = this.getBoard(boardId);
      if (board) {
        board.lists = board.lists.filter(list => list.id !== listId);
        this.save();
        this.renderBoard();
      }
    },
  
    // Card CRUD operations
    createCard(boardId, listId, title, description = '') {
      const list = this.getList(boardId, listId);
      if (list) {
        const newCard = {
          id: Date.now().toString(),
          title: title,
          description: description
        };
        list.cards.push(newCard);
        this.save();
        this.renderBoard();
      }
    },
  
    getCard(boardId, listId, cardId) {
      const list = this.getList(boardId, listId);
      if (list) {
        return list.cards.find(card => card.id === cardId);
      }
      return null;
    },
  
    updateCard(boardId, listId, cardId, title, description) {
      const card = this.getCard(boardId, listId, cardId);
      if (card) {
        card.title = title;
        card.description = description;
        this.save();
        this.renderBoard();
      }
    },
  
    deleteCard(boardId, listId, cardId) {
      const list = this.getList(boardId, listId);
      if (list) {
        list.cards = list.cards.filter(card => card.id !== cardId);
        this.save();
        this.renderBoard();
      }
    },
  
    moveCard(sourceBoardId, sourceListId, cardId, targetBoardId, targetListId, targetPosition) {
      // Get source list and card
      const sourceList = this.getList(sourceBoardId, sourceListId);
      const cardIndex = sourceList.cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return;
      
      // Get the card and remove it from the source list
      const card = sourceList.cards.splice(cardIndex, 1)[0];
      
      // Add the card to the target list at the specified position
      const targetList = this.getList(targetBoardId, targetListId);
      if (targetList) {
        if (targetPosition >= 0 && targetPosition <= targetList.cards.length) {
          targetList.cards.splice(targetPosition, 0, card);
        } else {
          targetList.cards.push(card);
        }
        this.save();
        this.renderBoard();
      }
    },
  
    // UI rendering functions
    render() {
      this.renderDashboard();
    },
  
    renderDashboard() {
      const dashboardEl = document.getElementById('dashboard');
      const boardViewEl = document.getElementById('board-view');
      dashboardEl.style.display = 'block';
      boardViewEl.style.display = 'none';
      
      const boardsContainer = document.querySelector('.boards-container');
      boardsContainer.innerHTML = '';
  
      if (this.boards.length === 0) {
        boardsContainer.innerHTML = '<p>No boards yet. Create your first board to get started!</p>';
      } else {
        this.boards.forEach(board => {
          const boardCard = document.createElement('div');
          boardCard.className = 'board-card';
          boardCard.setAttribute('data-board-id', board.id);
          
          boardCard.innerHTML = `
            <h3>${board.name}</h3>
            <p>${board.lists.length} lists</p>
            <div class="board-card-actions">
              <button class="edit-board" data-board-id="${board.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-board" data-board-id="${board.id}">
                <i class="fas fa-trash delete-icon"></i>
              </button>
            </div>
          `;
          
          // Open board on click
          boardCard.addEventListener('click', (e) => {
            if (!e.target.closest('.board-card-actions')) {
              this.openBoard(board.id);
            }
          });
          
          boardsContainer.appendChild(boardCard);
        });
        
        // Set up event handlers for board actions
        document.querySelectorAll('.edit-board').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const boardId = btn.getAttribute('data-board-id');
            this.showEditBoardModal(boardId);
          });
        });
        
        document.querySelectorAll('.delete-board').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const boardId = btn.getAttribute('data-board-id');
            if (confirm('Are you sure you want to delete this board?')) {
              this.deleteBoard(boardId);
            }
          });
        });
      }
    },
  
    openBoard(boardId) {
      const board = this.getBoard(boardId);
      if (board) {
        this.activeBoardId = boardId;
        this.renderBoard();
      }
    },
  
    renderBoard() {
      const dashboardEl = document.getElementById('dashboard');
      const boardViewEl = document.getElementById('board-view');
      dashboardEl.style.display = 'none';
      boardViewEl.style.display = 'block';
      
      const board = this.getBoard(this.activeBoardId);
      if (!board) {
        this.renderDashboard();
        return;
      }
      
      // Update board title
      document.getElementById('board-title').textContent = board.name;
      
      // Render lists
      const listsContainer = document.getElementById('lists-container');
      listsContainer.innerHTML = '';
      
      board.lists.forEach(list => {
        const listEl = document.createElement('div');
        listEl.className = 'list';
        listEl.setAttribute('data-list-id', list.id);
        
        // List header
        const listHeader = document.createElement('div');
        listHeader.className = 'list-header';
        listHeader.innerHTML = `
          <h3 class="list-title">${list.name}</h3>
          <div class="list-actions">
            <button class="edit-list" data-list-id="${list.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-list" data-list-id="${list.id}">
              <i class="fas fa-trash delete-icon"></i>
            </button>
          </div>
        `;
        
        // Cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'cards-container';
        cardsContainer.setAttribute('data-list-id', list.id);
        
        list.cards.forEach(card => {
          const cardEl = this.createCardElement(card, list.id);
          cardsContainer.appendChild(cardEl);
        });
        
        // Add card button
        const addCardBtn = document.createElement('button');
        addCardBtn.className = 'add-card-btn';
        addCardBtn.innerHTML = '<i class="fas fa-plus"></i> Add a card';
        addCardBtn.setAttribute('data-list-id', list.id);
        
        listEl.appendChild(listHeader);
        listEl.appendChild(cardsContainer);
        listEl.appendChild(addCardBtn);
        
        listsContainer.appendChild(listEl);
      });
      
      // Set up drag and drop
      this.setupDragAndDrop();
      
      // Set up event listeners for list and card actions
      this.setupEventListeners();
    },
  
    createCardElement(card, listId) {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.setAttribute('draggable', 'true');
      cardEl.setAttribute('data-card-id', card.id);
      cardEl.setAttribute('data-list-id', listId);
      
      cardEl.innerHTML = `
        <h4 class="card-title">${card.title}</h4>
        ${card.description ? `<p class="card-description">${card.description}</p>` : ''}
        <div class="card-actions">
          <button class="edit-card" data-card-id="${card.id}" data-list-id="${listId}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-card" data-card-id="${card.id}" data-list-id="${listId}">
            <i class="fas fa-trash delete-icon"></i>
          </button>
        </div>
      `;
      
      return cardEl;
    },
  
    setupDragAndDrop() {
      const cards = document.querySelectorAll('.card');
      const containers = document.querySelectorAll('.cards-container');
      let draggedCard = null;
      
      cards.forEach(card => {
        // Drag start
        card.addEventListener('dragstart', (e) => {
          draggedCard = card;
          setTimeout(() => {
            card.classList.add('dragging');
          }, 0);
        });
        
        // Drag end
        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
          draggedCard = null;
        });
      });
      
      containers.forEach(container => {
        // Drag over
        container.addEventListener('dragover', (e) => {
          e.preventDefault();
          const afterElement = this.getDragAfterElement(container, e.clientY);
          
          if (draggedCard) {
            if (afterElement == null) {
              container.appendChild(draggedCard);
            } else {
              container.insertBefore(draggedCard, afterElement);
            }
          }
        });
        
        // Drop
        container.addEventListener('drop', (e) => {
          e.preventDefault();
          if (draggedCard) {
            // Get source and target list IDs
            const sourceListId = draggedCard.getAttribute('data-list-id');
            const targetListId = container.getAttribute('data-list-id');
            const cardId = draggedCard.getAttribute('data-card-id');
            
            // Calculate position in the new list
            const cards = [...container.getElementsByClassName('card')];
            const position = cards.indexOf(draggedCard);
            
            // Update card's list ID attribute
            draggedCard.setAttribute('data-list-id', targetListId);
            
            // Update the data model
            this.moveCard(
              this.activeBoardId,
              sourceListId,
              cardId,
              this.activeBoardId,
              targetListId,
              position
            );
          }
        });
      });
    },
    
    getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
      
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    },
  
    setupEventListeners() {
      // Back to dashboard button
      document.getElementById('back-to-dashboard').addEventListener('click', () => {
        this.renderDashboard();
      });
      
      // Edit board button
      document.getElementById('edit-board-btn').addEventListener('click', () => {
        this.showEditBoardModal(this.activeBoardId);
      });
      
      // Delete board button
      document.getElementById('delete-board-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this board?')) {
          this.deleteBoard(this.activeBoardId);
          this.renderDashboard();
        }
      });
      
      // Edit list buttons
      document.querySelectorAll('.edit-list').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const listId = btn.getAttribute('data-list-id');
          this.showEditListModal(listId);
        });
      });
      
      // Delete list buttons
      document.querySelectorAll('.delete-list').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const listId = btn.getAttribute('data-list-id');
          if (confirm('Are you sure you want to delete this list and all its cards?')) {
            this.deleteList(this.activeBoardId, listId);
          }
        });
      });
      
      // Add card buttons
      document.querySelectorAll('.add-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const listId = btn.getAttribute('data-list-id');
          this.showAddCardModal(listId);
        });
      });
      
      // Edit card buttons
      document.querySelectorAll('.edit-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cardId = btn.getAttribute('data-card-id');
          const listId = btn.getAttribute('data-list-id');
          this.showEditCardModal(listId, cardId);
        });
      });
      
      // Delete card buttons
      document.querySelectorAll('.delete-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cardId = btn.getAttribute('data-card-id');
          const listId = btn.getAttribute('data-list-id');
          if (confirm('Are you sure you want to delete this card?')) {
            this.deleteCard(this.activeBoardId, listId, cardId);
          }
        });
      });
      
      // Open card details on click
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
          // Only trigger if not clicking on action buttons
          if (!e.target.closest('.card-actions')) {
            const cardId = card.getAttribute('data-card-id');
            const listId = card.getAttribute('data-list-id');
            this.showEditCardModal(listId, cardId);
          }
        });
      });
      
      // Add list button
      document.getElementById('add-list-btn').addEventListener('click', () => {
        this.showAddListModal();
      });
    },
  
    // Modal management
    showBoardModal(title = 'Create New Board', boardId = null) {
      const modal = document.getElementById('board-modal');
      document.getElementById('board-modal-title').textContent = title;
      const form = document.getElementById('board-form');
      const nameInput = document.getElementById('board-name');
      
      // Pre-fill form if editing existing board
      if (boardId) {
        const board = this.getBoard(boardId);
        if (board) {
          nameInput.value = board.name;
          this.isEditMode = true;
          this.activeBoardId = boardId;
        }
      } else {
        nameInput.value = '';
        this.isEditMode = false;
      }
      
      // Display modal
      modal.style.display = 'flex';
      nameInput.focus();
      
      // Close modal when clicking on X or outside
      const closeBtn = modal.querySelector('.close');
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
      
      window.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      };
      
      // Handle form submission
      form.onsubmit = (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (name) {
          if (this.isEditMode && this.activeBoardId) {
            this.updateBoard(this.activeBoardId, name);
          } else {
            this.createBoard(name);
          }
          modal.style.display = 'none';
        }
      };
    },
  
    showAddBoardModal() {
      this.showBoardModal('Create New Board');
    },
  
    showEditBoardModal(boardId) {
      this.showBoardModal('Edit Board', boardId);
    },
  
    showListModal(title = 'Add New List', listId = null) {
      const modal = document.getElementById('list-modal');
      document.getElementById('list-modal-title').textContent = title;
      const form = document.getElementById('list-form');
      const nameInput = document.getElementById('list-name');
      
      // Pre-fill form if editing existing list
      if (listId) {
        const list = this.getList(this.activeBoardId, listId);
        if (list) {
          nameInput.value = list.name;
          this.isEditMode = true;
          this.activeListId = listId;
        }
      } else {
        nameInput.value = '';
        this.isEditMode = false;
      }
      
      // Display modal
      modal.style.display = 'flex';
      nameInput.focus();
      
      // Close modal when clicking on X or outside
      const closeBtn = modal.querySelector('.close');
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
      
      window.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      };
      
      // Handle form submission
      form.onsubmit = (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (name) {
          if (this.isEditMode && this.activeListId) {
            this.updateList(this.activeBoardId, this.activeListId, name);
          } else {
            this.createList(this.activeBoardId, name);
          }
          modal.style.display = 'none';
        }
      };
    },
  
    showAddListModal() {
      this.showListModal('Add New List');
    },
  
    showEditListModal(listId) {
      this.showListModal('Edit List', listId);
    },
  
    showCardModal(title = 'Add New Card', listId = null, cardId = null) {
      const modal = document.getElementById('card-modal');
      document.getElementById('card-modal-title').textContent = title;
      const form = document.getElementById('card-form');
      const titleInput = document.getElementById('card-title');
      const descInput = document.getElementById('card-description');
      
      // Pre-fill form if editing existing card
      if (cardId && listId) {
        const card = this.getCard(this.activeBoardId, listId, cardId);
        if (card) {
          titleInput.value = card.title;
          descInput.value = card.description || '';
          this.isEditMode = true;
          this.activeListId = listId;
          this.activeCardId = cardId;
        }
      } else {
        titleInput.value = '';
        descInput.value = '';
        this.isEditMode = false;
        this.activeListId = listId;
      }
      
      // Display modal
      modal.style.display = 'flex';
      titleInput.focus();
      
      // Close modal when clicking on X or outside
      const closeBtn = modal.querySelector('.close');
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
      
      window.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      };
      
      // Handle form submission
      form.onsubmit = (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const description = descInput.value.trim();
        if (title) {
          if (this.isEditMode && this.activeListId && this.activeCardId) {
            this.updateCard(this.activeBoardId, this.activeListId, this.activeCardId, title, description);
          } else if (this.activeListId) {
            this.createCard(this.activeBoardId, this.activeListId, title, description);
          }
          modal.style.display = 'none';
        }
      };
    },
  
    showAddCardModal(listId) {
      this.showCardModal('Add New Card', listId);
    },
  
    showEditCardModal(listId, cardId) {
      this.showCardModal('Edit Card', listId, cardId);
    }
  };
  
  // Initialize the app when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize the board manager
    BoardManager.init();
    
    // Set up initial event listeners
    document.getElementById('create-board-btn').addEventListener('click', () => {
      BoardManager.showAddBoardModal();
    });
  });
