<template>
  <div class="flex w-screen h-screen text-gray-700">
    <div class="flex flex-col flex-shritng-0 w-64 border-r border-gray-300 bg-gray-100">
      <!-- sidebar -->
      <div class="h-0 overflow-auto flex-grow">
        <div class="mt-4">
          <div class="flex items-center justify-between h-8 text-sm pl-8 pr-3 ml-2">
            <button @click="activeNote = {}">
              All notes
            </button>
            <button 
              class="text-center border border-gray-500 pl-3 pr-3 mr-2"
              @click="newNote"
            >
              +
            </button>
          </div>
          <a
            v-for="note in notes"
            :key="note.created"
            class="flex items-center h-8 text-sm pl-8 pr-3"
            href="#"
            @click.prevent="openNote(note)"
          >
            <span class="ml-2 leading-none">{{ new Date(note.created).toLocaleString() }}</span>
          </a>
        </div>
      </div>
    </div>

    <div
      v-if="Object.keys(activeNote).length"
      class="flex flex-col flex-grow"
    >
      <!-- main content -->
      <div class="flex flex-col flex-grow overflow-auto">
        <editor-content :editor="editor" />
      </div>
      <div class="flex justify-end items-center h-16 bg-gray-100 border-t border-gray-300 text-right px-8">
        <button
          class="border border-gray-500 py-2 px-6 rounded hover:bg-white"
          @click="saveNote"
        >
          Save Note
        </button>
      </div>
    </div>
    <div 
      v-else
      class="prose flex flex-col flex-grow"
    >
      <div
        v-for="note in notes"
        :key="note.created"
      >
        <h1>{{ note.created }}</h1>
        <div v-html="note.content" />
        <hr>
      </div>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

export default {
	name: "App",
	components: {
		EditorContent
	},

	data() {
		return {
			editor: null,
			database: null,
			notes: [],
			activeNote: {}
		}
	},
	async created() {
		this.database = await this.getDatabase();
		let notes = await this.getNotes();
		this.notes = notes.reverse();
	},
	mounted() {
		this.editor = new Editor({
			content: '',
			extensions: [
				StarterKit
			],
			editorProps: {
				attributes: {
					class: "prose my-6 mx-auto focus:online-none"
				}
			}
		})
	},
	beforeUnmount() {
		this.editor.destroy()
	},
	methods: {
		async getDatabase() {
			return new Promise((resolve, reject) => {
				let db = window.indexedDB.open('notes')

				db.onerror = e => {
					reject(e.target.result, "Error opening database")
				};

				db.onsuccess = e => {
					resolve(e.target.result)
				}

				db.onupgradeneeded = e => {
					// e.target.result.deleteObjectStore('notes');
					e.target.result.createObjectStore('notes', { keyPath: "created" });
				}
			})
		},
		async saveNote() {
			console.log('fired')
			return new Promise((resolve, reject) => {
				let noteStore = this.database.transaction('notes', 'readwrite')
					.objectStore('notes');
				
				let noteRequest = noteStore.get(this.activeNote.created);

				noteRequest.onerror = e => {
					reject('Error saving the note in the database', e.target.result)
				}
				
				noteRequest.onsuccess = e => {
					let note = e.target.result;
					note.content = this.editor.getHTML();

					let updateRequest = noteStore.put(note);

					updateRequest.onerror = e => {
						reject('Error storing the updated note in the database', e.target.result)
					}

					updateRequest.onsuccess = e => {
						let noteIndex = this.notes.findIndex(n => n.created === note.created);
						this.notes[noteIndex] = note;
						resolve(e.target.result);
					}
				}
			})
		},
		async getNotes() {
			console.log('notes fired');
			return new Promise((resolve) => {
				this.database.transaction('notes')
					.objectStore('notes')
					.getAll()
					.onsuccess = e => {
						console.log("ALO", e.target.result);
						resolve(e.target.result)
					};
			})
		},
		openNote(note) {
			this.editor.commands.setContent(note.content);
			this.activeNote = note;
		},

		newNote() {
			return new Promise((resolve) => {
				let transaction = this.database.transaction('notes', 'readwrite');

				transaction.oncomplete = e => {
					resolve(e.target.result);
				}

				let date = new Date();
				let note = {
					created: date.getTime(),
					content: ''
				}
	
				this.notes.unshift(note);

				transaction.objectStore('notes').add(note)
				
			})

		}

	}
};
</script>

