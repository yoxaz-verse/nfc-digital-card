<script setup lang="ts">import { onMounted,ref } from 'vue';import { useRouter } from 'vue-router';import { useProfileStore } from '../stores/profile';const router=useRouter(),store=useProfileStore(),error=ref('');onMounted(async()=>{try{await store.restore();await store.publish();setTimeout(()=>router.replace('/dashboard'),500)}catch(e:any){error.value=e.message}})</script>
<template><div class="auth-callback"><div class="spinner">✳</div><h1>{{error?'Sign-in failed':'Publishing your profile…'}}</h1><p>{{error||'Securely connecting your account.'}}</p></div></template>

