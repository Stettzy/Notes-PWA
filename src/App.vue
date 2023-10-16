<template>
	<div class="flex w-screen h-screen text-gray-700">
		<div class="flex flex-col flex-shritng-0 w-64 border-r border-gray-300 bg-gray-100">
			<!-- sidebar -->
			<div class="h-0 overflow-auto flex-grow">
				<div class="mt-4">
					<a 
						class="flex items-center h-8 text-sm pl-8 pr-3"
						href="#"
						v-for="note in notes"
						:key="note.created"	
					>
						<span class="ml-2 leading-none">{{ new Date(note.created).toLocaleString() }}</span>
					</a>
				</div>
			</div>
		</div>
		<div class="flex flex-col flex-grow">
			<!-- main content -->
			<div class="flex flex-col flex-grow overflow-auto">
				<editor-content :editor="editor"/>
			</div>
			<div class="flex justify-end items-center h-16 bg-gray-100 border-t border-gray-300 text-right px-8">
				<button @click="saveNote" class="border border-gray-500 py-2 px-6 rounded hover:bg-white">Save Note</button>
			</div>
		</div>
	</div>
</template>

<script>
import {Editor, EditorContent} from '@tiptap/vue-3';
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
			notes: []
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
				let db = window.indexedDB.open('notes', 1)
				
				db.onerror = e => {
					reject(e.target.result, "Error opening database")
				};

				db.onsuccess = e => {
					resolve(e.target.result)
				}

				db.onupgradeneeded = e => {
					e.target.result.deleteObjectStore('notes');
					e.target.result.createObjectStore('notes', {keyPath: "created"});
				}
			})
		},
		async saveNote() {
			console.log('fired')
			return new Promise((resolve) => {
				let transaction = this.database.transaction('notes', 'readwrite');

				transaction.oncomplete = e => {
					resolve(e.target.result);
				}

				let now = new Date();

				let note = {
					content: this.editor.getHTML(),
					created: now.getTime()
				}

				this.notes.unshift(note);

				transaction.objectStore('notes').add({
					content: this.editor.getHTML(),
					created: now.getTime()
				})
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
		}
	}
};
</script>

