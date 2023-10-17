import { createApp } from "vue";
import App from "./App.vue";
import './app.css';
import './registerServiceWorker'

import { createStore } from 'vuex';

const store = createStore({
    state() {
        return {
            database: null,
            editor: null,
            notes: [],
            activeNote: {},
        }
    },
    mutations: {
        updateDatabase(state, database) {
            state.database = database
        },

        updateEditor(state, editor) {
            state.editor = editor
        },

        updateNotes(state, notes) {
            state.notes = notes
        },

        updateActiveNote(state, note) {
            state.activeNote = note
        }
    },
    actions: {
        init({ dispatch }) {
            dispatch('initDatabase');
            dispatch('initNotes');
        },

        initDatabase({commit}) {
            // DB Initialization
            let db = window.indexedDB.open('notes')

            db.onerror = e => {
                console.log(e.target.result, "Error opening database")
            };

            db.onsuccess = e => {
                console.log(e.target)
                commit('updateDatabase', e.target.result);
            }

            db.onupgradeneeded = e => {
                e.target.result.deleteObjectStore('notes');
                e.target.result.createObjectStore('notes', { keyPath: "created" });
            }
        },

        initNotes({commit, state}) {    
            // Notes initialization
            state.database.transaction('notes')
                .objectStore('notes')
                .getAll()
                .onsuccess = e => {
                    commit('updateNotes', e.target.result)
                };
        },
        saveNote({commit, state}) {
            let noteStore = state.database.transaction('notes', 'readwrite')
            .objectStore('notes');
        
            let noteRequest = noteStore.get(state.activeNote.created);

            noteRequest.onerror = e => {
                reject('Error saving the note in the database', e.target.result)
            }
            
            noteRequest.onsuccess = e => {
                let note = e.target.result;
                note.content = state.editor.getHTML();

                let updateRequest = noteStore.put(note);

                updateRequest.onerror = e => {
                    reject('Error storing the updated note in the database', e.target.result)
                }

                updateRequest.onsuccess = e => {
                    let noteIndex = state.notes.findIndex(n => n.created === note.created);
                    state.notes[noteIndex] = note;
                    commit('updateNotes', e.target.result);
                }
            }
        },
        addNewNote({commit, state}) {
            let transaction = state.database.transaction('notes', 'readwrite');

            transaction.oncomplete = e => {
                resolve(e.target.result);
            }

            let date = new Date();
            let note = {
                created: date.getTime(),
                content: ''
            }

            let notes = state.notes.unshift(note);

            console.log(notes);

            commit('updateNotes', notes);
            commit('updateActiveNote', note);

            transaction.objectStore('notes').add(note);
        }
    }
});

const app = createApp(App);
app.use(store);
app.mount("#app");

store.dispatch('init');
