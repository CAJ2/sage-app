<template>
  <ion-page>
    <ion-content>
      <ion-tabs>
        <ion-router-outlet />

        <ion-tab-bar slot="bottom">
          <ion-tab-button href="/tabs/tab-home" tab="tab-home">
            <ion-icon :icon="ioniconsHomeOutline" />
            <ion-label>Home</ion-label>
          </ion-tab-button>

          <ion-tab-button href="/tabs/tab-search" tab="tab-search">
            <ion-icon :icon="ioniconsImagesOutline" />
            <ion-label>Search</ion-label>
          </ion-tab-button>

          <ion-tab-button href="/tabs/tab3" tab="tab3">
            <ion-icon :icon="ioniconsBulbOutline" />
            <ion-label>Tab 3</ion-label>
          </ion-tab-button>

          <ion-tab-button href="/tabs/tab4" tab="tab4">
            <ion-icon :icon="ioniconsAccessibilityOutline" />
            <ion-label>Animation examples</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';

definePageMeta({
  alias: ['/'],
});
</script>
