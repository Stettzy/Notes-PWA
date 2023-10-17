<template>
    <div 
		class="w-full text-center py-2 bg-red-300 border-b border-red-700 text-white"
		v-if="this.isOffline"
	>
        <p>Sorry but you're offline</p>
    </div>
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

    mounted() {

	
		window.addEventListener('offline', () => {
			console.log('ITS OFFLINE')
			this.isOffline = true
		})
		window.addEventListener('online', () => {
			console.log('ITS ONLLINE')
			this.isOffline = false
		})
    },

};
</script>
