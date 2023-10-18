<template>
    <div class="flex flex-col flex-shritng-0 w-64 border-r border-gray-300 bg-gray-100">
        <!-- sidebar -->
        <div class="h-0 overflow-auto flex-grow">
            <div class="mt-4">
                <div class="flex items-center justify-between h-8 text-sm pl-8 pr-3 ml-2">
                    <button @click="activeNote = {}">All notes</button>
                    <button class="text-center border border-gray-500 pl-3 pr-3 mr-2" @click="newNote">+</button>
                </div>
                <a 
                    v-for="note in notes" :key="note.created" class="flex items-center h-8 text-sm pl-8 pr-3"
                    :style="note === activeNote ? 'font-weight: bold;' : 'font-weight: medium;'" href="#"
                    @click.prevent="openNote(note)">
                    <span class="ml-2 leading-none">{{ new Date(note.created).toLocaleString() }}</span>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/vue-3';
    
export default {
    methods: {
        openNote(note) {
            console.log(note)
            this.$store.commit('updateActiveNote', note);

            let editore = new Editor({
                content: note.content,
                extensions: [
                    StarterKit
                ],
                editorProps: {
                    attributes: {
                        class: "prose my-6 mx-auto focus:online-none"
                    }
                }
            })
        
            this.$store.commit('updateEditor', editore);
            this.$store.state.editor.commands.setContent(note.content);
        
        },

        showAllNotes() {
            this.$store.state.editor.commands.clearContent();
            this.$store.commit('updateActiveNote', {});
        },
        addNewNote() {
            this.$store.commit('addNewNote');
        }
    },
    computed: {
        notes() {
            return this.$store.state.notes
        },
        activeNote() {
            return this.$store.state.activeNote;
        }
    },


}
</script>