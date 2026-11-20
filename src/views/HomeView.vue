<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="landing">
    <header class="landing-nav">
      <RouterLink class="brand" to="/"><span class="brand-mark">C</span><span>Card Studio <small>3D</small></span></RouterLink>
      <RouterLink class="nav-cta" to="/templates">Open editor <span>→</span></RouterLink>
    </header>
    <main>
      <section class="hero">
        <div class="hero-copy">
          <span class="hero-kicker">The modern NFC card studio</span>
          <h1>Your first impression, <em>designed by you.</em></h1>
          <p>Create a polished business card from your phone. Add your details, customize both sides, and see every change in 3D.</p>
          <div class="hero-actions">
            <RouterLink class="hero-primary" to="/templates">Create your card <span>→</span></RouterLink>
            <a class="hero-secondary" href="#how">See how it works</a>
          </div>
          <div class="hero-proof"><span>✓ No design experience needed</span><span>✓ Saved on your device</span></div>
        </div>
        <div class="hero-art" aria-label="A 3D business card preview">
          <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
          <div class="demo-card"><span class="demo-company">MALABAR TECH</span><div><strong>Arjun Menon</strong><small>Creative Director</small></div><i></i></div>
          <div class="float-pill pill-front">✦ Live 3D preview</div><div class="float-pill pill-back">↔ Front & back</div>
        </div>
      </section>
      <section id="how" class="how-section">
        <div class="section-heading"><span>Simple by design</span><h2>From blank to brilliant in minutes.</h2></div>
        <div class="steps">
          <article><b>01</b><div class="step-icon">⌨</div><h3>Add your details</h3><p>Name, role, company, phone, email, website and address—all in one place.</p></article>
          <article><b>02</b><div class="step-icon">◫</div><h3>Make it yours</h3><p>Choose colors, type and layouts, then fine-tune every element by touch.</p></article>
          <article><b>03</b><div class="step-icon">◇</div><h3>Preview every angle</h3><p>Flip between front and back or rotate your finished card in interactive 3D.</p></article>
        </div>
      </section>
      <section class="landing-cta"><div><span>Ready when you are</span><h2>Build a card worth sharing.</h2></div><RouterLink to="/templates">Create your card now →</RouterLink></section>
    </main>
    <footer><div class="brand"><span class="brand-mark">C</span><span>Card Studio</span></div><span>Designed for the way you work.</span></footer>
  </div>
</template>
