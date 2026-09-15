<template>
  <div class="projects-page">
    <!-- 顶部标题栏 -->
    <div class="header">
      <button class="back-btn" @click="store.projectsOpenState = false">
        <ArrowLeft :size="20" />
        <span>返回</span>
      </button>
      <h2>项目作品</h2>
    </div>

    <!-- 项目卡片网格 -->
    <div class="projects-grid">
      <a
        v-for="item in projectsList"
        :key="item.id"
        class="project-card"
        :href="item.github"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="card-cover">
          <img :src="item.cover" :alt="item.name" />
        </div>
        <div class="card-info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.desc }}</p>
          <div class="tags">
            <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { projectsList } from "@/data/projects.js";

const store = mainStore();
</script>

<style lang="scss" scoped>
.projects-page {
  width: 100%;
  height: 100%;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fade 0.3s ease;

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #fff;

    .back-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: none;
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(-2px);
      }
    }

    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
    overflow-y: auto;
    padding-right: 6px;

    .project-card {
      display: block;
      text-decoration: none;
      color: inherit;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .card-cover {
        width: 100%;
        height: 160px;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.2);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
      }

      &:hover .card-cover img {
        transform: scale(1.05);
      }

      .card-info {
        padding: 1rem;

        h3 {
          margin: 0 0 0.5rem;
          font-size: 1.1rem;
          color: #fff;
        }

        p {
          margin: 0 0 0.75rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;

          span {
            padding: 2px 8px;
            font-size: 0.75rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
  }
}
</style>
