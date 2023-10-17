<!-- <template>
    <div class="flex flex-col flex-grow">
        <div class="flex flex-col flex-grow overflow-auto">
            <editor-content :editor="editor" />
        </div>

        <div class="flex justify-end items-center h-16 bg-gray-100 border-t border-gray-300 text-right px-8">
            <button class="border border-gray-500 py-2 px-6 rounded hover:bg-white" @click="$store.dispatch('saveNote')">Save Note</button>
        </div>
    </div>
</template>
<script>
    import StarterKit from '@tiptap/starter-kit';
    import { Editor,  EditorContent } from '@tiptap/vue-3';

    export default {
        components: {
            EditorContent
        },
        mounted() {
            let editor = new Editor({
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

            this.$store.commit('updateEditor', editor);
        },
        computed: {
            editor() {
                return this.$store.state.editor;
            }
        },
        beforeUnmount() {
            this.editor.destroy()
        },
}
</script> -->