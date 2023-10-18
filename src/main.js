import { createApp } from "vue";
import App from "./App.vue";
import './app.css';
import './registerServiceWorker'

import { createStore } from 'vuex';
import { Editor } from "@tiptap/vue-3";

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
        async init({ dispatch }) {
            await dispatch('initDatabase');
            await dispatch('initNotes');
        },
        
        async initDatabase({ commit }) {
            return new Promise((resolve, reject) => {
                let db = window.indexedDB.open('notes');
        
                db.onerror = (e) => {
                    console.log(e.target.result, "Error opening database");
                    reject(e.target.result);
                };
        
                db.onsuccess = (e) => {
                    commit('updateDatabase', e.target.result);
                    resolve(e.target.result);
                };
        
                db.onupgradeneeded = (e) => {
                    e.target.result.deleteObjectStore('notes');
                    e.target.result.createObjectStore('notes', { keyPath: "created" });
                };
            });
        },

        async initNotes({ commit, state }) {
            if (state.database) { // Check if state.database is defined
                // Notes initialization
                const transaction = state.database.transaction('notes', 'readwrite');
                const noteStore = transaction.objectStore('notes');

                const notes = await new Promise((resolve) => {
                    const request = noteStore.getAll();
                    request.onsuccess = (e) => {
                        resolve(e.target.result);
                    };
                });

                commit('updateNotes', notes);
            } else {
                console.error("Database not initialized. Make sure initDatabase is called before initNotes.");
            }
        },
        
        async saveNote({ commit, state }) {
            const noteStore = state.database.transaction('notes', 'readwrite').objectStore('notes');
            const noteRequest = noteStore.get(state.activeNote.created);

            await new Promise((resolve, reject) => {
                noteRequest.onerror = (e) => {
                    reject('Error saving the note in the database', e.target.result);
                };
                
                noteRequest.onsuccess = (e) => {
                    const note = e.target.result;
                    note.content = state.editor.getHTML();

                    const updateRequest = noteStore.put(note);

                    updateRequest.onerror = (e) => {
                        reject('Error storing the updated note in the database', e.target.result);
                    }

                    updateRequest.onsuccess = (e) => {
                        const noteIndex = state.notes.findIndex(n => n.created === note.created);
                        state.notes[noteIndex] = note;
                        commit('updateNotes', state.notes);
                        resolve(e.target.result);
                    }
                }
            });
        },
        
        async addNewNote({ commit, state }) {
            const transaction = state.database.transaction('notes', 'readwrite');
            const noteStore = transaction.objectStore('notes');

            const date = new Date();
            const note = {
                created: date.getTime(),
                content: ''
            }

            const request = noteStore.add(note);

            await new Promise((resolve) => {
                request.onsuccess = (e) => {
                    const notes = [note, ...state.notes];
                    commit('updateNotes', notes);
                    commit('updateActiveNote', note);
                    resolve(e.target.result);
                };
            });
        }
    }
});

const app = createApp(App);
app.use(store);
app.mount("#app");

store.dispatch('init');
