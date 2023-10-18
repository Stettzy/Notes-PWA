<template>
    <div class="flex w-screen h-screen text-gray-700">
        <sidebar></sidebar>
        <editor v-if="Object.keys(activeNote).length"></editor>
        <notes v-else></notes>
    </div>
</template>

<script>


import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Notes from './components/Notes';

export default {
    name: "App",

    components: {
        Sidebar,
        Editor,
        Notes
    },

    computed: {
        activeNote() {
            return this.$store.state.activeNote
        }
    }

};
</script>
