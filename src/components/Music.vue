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
  <!-- 音乐列表弹窗 -->
  <Transition name="fade" mode="out-in">
    <div class="music-list" v-show="musicListShow" @click="closeMusicList()">
      <Transition name="zoom">
        <div class="list" v-show="musicListShow" @click.stop>
          <close-one
            class="close"
            theme="filled"
            size="28"
            fill="#ffffff60"
            @click="closeMusicList()"
          />
          <Player
            ref="playerRef"
            :songServer="playerData.server"
            :songType="playerData.type"
            :songId="playerData.id"
            :volume="volumeNum"
          />
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import {
  GoStart,
  PlayOne,
  Pause,
  GoEnd,
  CloseOne,
  VolumeMute,
  VolumeSmall,
  VolumeNotice,
} from "@icon-park/vue-next";
import Player from "@/components/Player.vue";
import { mainStore } from "@/store";

const store = mainStore();
// 折叠/展开状态
const isExpand = ref(false);
// 音量条数据
const volumeShow = ref(false);
const volumeNum = ref(store.musicVolume ? store.musicVolume : 0.7);
// 播放列表数据
const musicListShow = ref(false);
const playerRef = ref(null);
const playerData = reactive({
  server: import.meta.env.VITE_SONG_SERVER,
  type: import.meta.env.VITE_SONG_TYPE,
  id: import.meta.env.VITE_SONG_ID,
});

// 开启播放列表
const openMusicList = () => {
  musicListShow.value = true;
  playerRef.value.toggleList();
};
// 关闭播放列表
const closeMusicList = () => {
  musicListShow.value = false;
  playerRef.value.toggleList();
};
// 音乐播放暂停
const changePlayState = () => {
  playerRef.value.playToggle();
};
// 音乐上下曲
const changeMusicIndex = (type) => {
  playerRef.value.changeSong(type);
};

onMounted(() => {
  // 空格键事件
  window.addEventListener("keydown", (e) => {
    if (!store.musicIsOk) {
      return;
    }
    if (e.code == "Space") {
      e.preventDefault();
      changePlayState();
    }
  });
  // 挂载方法至 window
  window.$openList = openMusicList;
});

// 监听音量变化
watch(
  () => volumeNum.value,
  (value) => {
    store.musicVolume = value;
    playerRef.value.changeVolume(store.musicVolume);
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
// 原音乐列表弹窗样式完全保留
.music-list {
  position: fixed;
  top: 0;
  left: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  backdrop-filter: blur(20px);
  z-index: 1000;
  .list {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: calc(50% - 300px);
    left: calc(50% - 320px);
    width: 640px;
    height: 600px;
    background-color: #ffffff66;
    border-radius: 6px;
    z-index: 1001;
    @media (max-width: 720px) {
      left: calc(50% - 45%);
      width: 90%;
    }
    .close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      display: block;
      &:hover {
        transform: scale(1.2);
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }
}
// 弹窗动画
.zoom-enter-active {
  animation: zoom 0.4s ease-in-out;
}
.zoom-leave-active {
  animation: zoom 0.3s ease-in-out reverse;
}
@keyframes zoom {
  0% {
    opacity: 0;
    transform: scale(0) translateY(-600px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
