import { newAccount, loginUser, logout, googleLogin, checkUser, setNewNote, getNotes, onChangeNotes, editNote, deleteNote } from './firebase.js';

const loginButton = document.querySelector('#login-button');
const logoutButton = document.querySelector('#logout-button');
const signupButton = document.querySelector('#btn-signup');
const loginModal = document.querySelector('#login-modal-container');
const signupModal = document.querySelector('#signup-modal-container');
const signupForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');
const btnGmail = document.querySelector('#btn-gmail');
// New Note consts
const newNoteForm = document.querySelector('#create-note-form');
const newNoteContent = document.querySelector('#create-note-content');
var newNoteTitle = undefined;
// Notes
const notesContainer = document.querySelector('#notes-container');
// New note Animation 
document.addEventListener('click', newNoteEvent);

let currentUser = {};
let notesList = [];

onChangeNotes(renderNotes);


checkUser(user => {
  if(user){
    loginButton.classList.add('hide');
    logoutButton.classList.remove('hide');
    currentUser = user;
  }else {
    loginButton.classList.remove('hide');
    logoutButton.classList.add('hide');
  }
});

loginButton.addEventListener('click', e => {
  loginModal.classList.remove('hide');
  loginModal.querySelector('.btn-close').addEventListener('click', e => loginModal.classList.add('hide'));

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-password').value;
    currentUser = await loginUser(email, password);
    loginForm.reset();
    loginModal.classList.add('hide');
    renderNotes();
  }, { once: true});
  btnGmail.addEventListener('click', googleLoginEvent, { once: true});
});

signupButton.addEventListener('click', e=> {
  e.preventDefault();
  loginModal.classList.add('hide');
  signupModal.classList.remove('hide');
  signupModal.querySelector('.btn-close').addEventListener('click', e => signupModal.classList.add('hide'));

  signupForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.querySelector('#signup-email').value;
    const password = document.querySelector('#signup-password').value;
    currentUser = await newAccount(email, password);
    signupForm.reset();
    signupModal.classList.add('hide');
  });
});


logoutButton.addEventListener('click', e => {
  logout();
  currentUser = {};
  loginButton.classList.remove('hide');
  renderNotes();
});


async function googleLoginEvent(event){
  event.preventDefault();
  currentUser = await googleLogin();

  loginForm.reset();
  loginModal.classList.add('hide');
  renderNotes();
}

// New note functions

function newNoteEvent(e){
  if(e.target == newNoteContent){
    if(document.querySelector('#create-note-title') == null){
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'create-note-title';
      input.title = 'title';
      input.className = 'create-note-title';
      input.placeholder = 'Title';
      input.autocomplete = 'off';
      newNoteForm.insertBefore(input, document.querySelector('#create-note-content'));
      newNoteTitle = document.querySelector('#create-note-title');
      newNoteTitle.focus();
    }
  } else {
    if(!newNoteForm.contains(e.target)){
      newNoteTitle !== undefined ? newNoteTitle.remove() : null;
    }
  }
}


newNoteForm.addEventListener('submit',async e => {
  try {
    e.preventDefault();

    const title = newNoteForm['create-note-title'].value;
    const content = newNoteForm['create-note-content'].value;
    newNoteForm.reset();
    if(title !== '' && content !== ''){
      const noteSendet = await setNewNote({
        title: title,
        content: content,
        uid: currentUser.uid ? currentUser.uid : '',
        index: notesList.length,
      });
    } else {
      console.log('Faltan llenar los campos!');
    }
  } catch (error) {
    console.log(error)
  }
});

function createNewNote(title, content, id, uid){
  const div = document.createElement('div');
  div.innerHTML = `<h1>${title}</h1>
  <p>${content}</p>
  <button type="button" class="note-btn btn-edit"><i class="fa-solid fa-pen"></i></button>
  ${currentUser.uid  ? '<button type="button" class="note-btn delete-btn"><i class="fa-solid fa-trash-can"></i></button>' : ''}
  `;
  div.setAttribute('data-id', id);
  div.className = uid !== "" ? 'note user-note' : 'note';
  notesContainer.insertAdjacentElement('afterbegin', div);
}

async function renderNotes() {
  notesContainer.innerHTML = '';
  notesList = await getNotes();
  notesList.forEach(note => {
    createNewNote(note.title, note.content, note.docId, note.uid);
  });
  setEditButtons();
}

function setEditButtons(){
  // const editButtons = document.querySelectorAll('#notes-container button');
  // editButtons.forEach(button => { /*Modificar este codigo */
  //   button.addEventListener('click', handleButtonEvent.bind(this, button));
  // });
  notesContainer.addEventListener('click', handleButtonEvent);
}

function launchEditModal(title, content, id){
  const editModal = document.createElement('div');
  editModal.className = 'background-drop';
  editModal.id = 'edit-modal-container';
  editModal.innerHTML  = `
  <form class="modal box-shadow" id="edit-form">
    <h1 class="modal-title">Edit</h1>
    <input type="text" title="title" id="title-edit" class="modal-email" required>
    <input type="text" title="content" id="content-edit" class="modal-password" required>
    <button type="submit" class="btn btn-save" id="save-submit">Save</button>
    <button type="button" class="btn-close">
      <span>x</span>
    </button>
  </form>
  `;
  document.querySelector('body').appendChild(editModal);
  editModal.querySelector('#title-edit').value = title;
  editModal.querySelector('#content-edit').value = content;
  editModal.querySelector('.btn-close').addEventListener('click', () => editModal.remove());

  const editForm = document.querySelector('#edit-form');
  editForm.addEventListener('submit', updateNote.bind(this, id, editModal), { once : true} );
}

function updateNote(id, editModal, event){
  event.preventDefault();

  const editedTitle = document.querySelector('#title-edit').value;
  const editedContent = document.querySelector('#content-edit').value;
  const note = notesList.find(note => note.docId == id);
  note.title = editedTitle;
  note.content = editedContent;
  editNote(id, note);
  editModal.remove();
}

function handleButtonEvent(event){
  // const content = button.previousElementSibling.innerText;
  // const title = button.previousElementSibling.previousElementSibling.innerText;
  // const id = button.dataset.id;

  // launchEditModal(title, content, id)
  const note = event.target.parentNode.parentNode;
  const title = note.querySelector('h1').innerText;
  const content = note.querySelector('p').innerText;
  const id = note.dataset.id
  if(id && event.target.classList[1] == 'fa-pen'){
    launchEditModal(title, content, id);
  } else if(id && event.target.classList[1] == 'fa-trash-can'){
    launchDeleteModal(id);
  }
}

function launchDeleteModal(id){
  const answer = confirm('Seguro que quieres borrar esta nota?');
  if(answer){
    deleteNote(id);
  }
}