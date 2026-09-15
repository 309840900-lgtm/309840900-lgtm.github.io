<template>
  <!-- 音乐悬浮播放器 -->
  <div
    class="music-float"
    v-show="store.musicOpenState"
  >
    <!-- 折叠状态：圆形按钮 -->
    <div 
      v-if="!isExpand" 
      class="fold-btn"
      @click="isExpand = true"
      title="展开播放器"
    >
      <Transition name="fade" mode="out-in">
        <div :key="store.playerState" class="play-icon" @click.stop="changePlayState">
          <play-one theme="filled" size="24" fill="#efefef" v-show="!store.playerState" />
          <pause theme="filled" size="24" fill="#efefef" v-show="store.playerState" />
        </div>
      </Transition>
    </div>
    <!-- 展开状态：完整面板 -->
    <div v-else class="expand-panel">
      <!-- 顶部按钮栏 -->
      <div class="btns">
        <span @click="openMusicList()">音乐列表</span>
        <span class="fold-text" @click="isExpand = false" title="收起">收起</span>
      </div>
      <!-- 播放控制区 -->
      <div class="control">
        <go-start theme="filled" size="28" fill="#efefef" @click="changeMusicIndex(0)" />
        <Transition name="fade" mode="out-in">
          <div :key="store.playerState" class="state" @click="changePlayState">
            <play-one theme="filled" size="44" fill="#efefef" v-show="!store.playerState" />
            <pause theme="filled" size="44" fill="#efefef" v-show="store.playerState" />
          </div>
        </Transition>
        <go-end theme="filled" size="28" fill="#efefef" @click="changeMusicIndex(1)" />
      </div>
      <!-- 信息/音量区 -->
      <div 
        class="menu"
        @mouseenter="volumeShow = true"
        @mouseleave="volumeShow = false"
      >
        <div class="name" v-show="!volumeShow">
          <span>{{
            store.getPlayerData.name
              ? store.getPlayerData.name + " - " + store.getPlayerData.artist
              : "未播放音乐"
          }}</span>
        </div>
        <div class="volume" v-show="volumeShow">
          <div class="icon">
            <volume-mute theme="filled" size="20" fill="#efefef" v-if="volumeNum == 0" />
            <volume-small
              theme="filled"
              size="20"
              fill="#efefef"
              v-else-if="volumeNum > 0 && volumeNum < 0.7"
            />
            <volume-notice theme="filled" size="20" fill="#efefef" v-else />
          </div>
          <el-slider v-model="volumeNum" :show-tooltip="false" :min="0" :max="1" :step="0.01" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import {
  GoStart,
  PlayOne,
  Pause,
  GoEnd,
  VolumeMute,
  VolumeSmall,
  VolumeNotice,
} from "@icon-park/vue-next";
import { mainStore } from "@/store";

const store = mainStore();
// 折叠/展开状态
const isExpand = ref(false);
// 音量条数据
const volumeShow = ref(false);
const volumeNum = ref(store.musicVolume ? store.musicVolume : 0.7);

// 打开音乐列表 → 调用全局 Player 实例的方法
const openMusicList = () => {
  if (window.$openMusicPanel) {
    window.$openMusicPanel();
  }
};

// 播放暂停 → 控制全局唯一的 Player
const changePlayState = () => {
  if (window.$playToggle) {
    window.$playToggle();
  }
};

// 上下切歌 → 控制全局唯一的 Player
const changeMusicIndex = (type) => {
  if (window.$changeSong) {
    window.$changeSong(type);
  }
};

onMounted(() => {
  // 兼容老的卡片调用
  window.$openList = openMusicList;
});

// 监听音量变化，同步给全局 Player
watch(
  () => volumeNum.value,
  (value) => {
    store.musicVolume = value;
    if (window.$setVolume) {
      window.$setVolume(value);
    }
  },
);
</script>

<style lang="scss" scoped>
.music-float {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 999;
  color: #efefef;

  // 折叠圆形按钮
  .fold-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      background: rgba(0, 0, 0, 0.35);
    }

    &:active {
      transform: scale(0.95);
    }

    .play-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  // 展开面板
  .expand-panel {
    width: 300px;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;

    .btns {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      span {
        background: rgba(255, 255, 255, 0.15);
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      }

      .fold-text {
        opacity: 0.85;
      }
    }

    .control {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-evenly;
      width: 100%;
      margin-bottom: 12px;

      .state {
        transition: opacity 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .i-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }

    .menu {
      height: 24px;
      line-height: 24px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .name {
        width: 100%;
        text-align: center;
        text-overflow: ellipsis;
        overflow-x: hidden;
        white-space: nowrap;
        font-size: 13px;
        opacity: 0.9;
        animation: fade 0.3s;
      }

      .volume {
        width: 100%;
        display: flex;
        align-items: center;
        flex-direction: row;
        animation: fade 0.3s;

        .icon {
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :deep(*) {
          transition: none;
        }

        :deep(.el-slider__button) {
          transition: 0.3s;
        }

        .el-slider {
          flex: 1;
          --el-slider-main-bg-color: #efefef;
          --el-slider-runway-bg-color: rgba(255, 255, 255, 0.25);
          --el-slider-button-size: 14px;
        }
      }
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // 移动端适配
  @media (max-width: 480px) {
    right: 16px;
    bottom: 16px;

    .expand-panel {
      width: calc(100vw - 32px);
    }
  }
}
</style>
