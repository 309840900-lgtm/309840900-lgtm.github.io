<template>
  <div class="player-float">
    <!-- 折叠状态：右下角圆形按钮 -->
    <div 
      v-if="!isExpand" 
      class="fold-btn"
      @click="isExpand = true"
      title="展开播放器"
    >
      <div 
        class="btn-icon" 
        :class="{ 'rotating': store.playerState }"
        @click="playToggle"
        title="播放/暂停"
      >
        <MusicOne theme="filled" size="24" fill="#efefef" />
      </div>
    </div>

    <!-- 展开状态：完整播放器面板（v-show 只隐藏不销毁，音乐不中断） -->
    <div v-show="isExpand" class="expand-panel">
      <div class="panel-header">
        <span class="title">音乐播放器</span>
        <span class="fold-text" @click="isExpand = false" title="收起">收起</span>
      </div>
      <APlayer
        v-if="playList[0]"
        ref="player"
        :audio="playList"
        :autoplay="store.playerAutoplay"
        :theme="theme"
        :autoSwitch="false"
        :loop="store.playerLoop"
        :order="store.playerOrder"
        :volume="volume"
        :showLrc="true"
        :listFolded="listFolded"
        :listMaxHeight="listMaxHeight"
        :noticeSwitch="false"
        @play="onPlay"
        @pause="onPause"
        @timeupdate="onTimeUp"
        @error="loadMusicError"
      />
    </div>
  </div>
</template>


<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
import { getPlayerList } from "@/api";
import { mainStore } from "@/store";
import APlayer from "@worstone/vue-aplayer";

const store = mainStore();
// 折叠/展开状态
const isExpand = ref(false);

// 获取播放器 DOM
const player = ref(null);
// 歌曲播放列表
const playList = ref([]);
// 歌曲播放项
const playIndex = ref(0);
// 配置项
const props = defineProps({
  // 主题色
  theme: {
    type: String,
    default: "#efefef",
  },
  // 默认音量
  volume: {
    type: Number,
    default: 0.7,
    validator: (value) => {
      return value >= 0 && value <= 1;
    },
  },
  // 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
  songServer: {
    type: String,
    default: "netease", //'netease' | 'tencent'
  },
  // 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
  songType: {
    type: String,
    default: "playlist",
  },
  // id
  songId: {
    type: String,
    default: "7452421335",
  },
  // 列表是否默认折叠
  listFolded: {
    type: Boolean,
    default: false,
  },
  // 列表最大高度
  listMaxHeight: {
    type: Number,
    default: 420,
  },
});
const listHeight = computed(() => {
  return props.listMaxHeight + "px";
});
  // 监听展开状态，展开自动弹出歌单
watch(isExpand, (val) => {
  if (val && player.value) {
    nextTick(() => {
      player.value.toggleList()
    })
  }
})

onMounted(() => {
  nextTick(() => {
    console.log('播放器传入参数：', props.songServer, props.songType, props.songId);
    console.log('读取的API地址：', import.meta.env.VITE_SONG_API);
    getPlayerList(props.songServer, props.songType, props.songId)
      .then((res) => {
        console.log('接口返回结果：', res);
        store.musicIsOk = true;
        playList.value = res;
      })
      .catch(err => {
        console.error('请求失败：', err);
        store.musicIsOk = false;
      });
  });
  window.$openMusicPanel = openMusicPanel
});
// 播放
const onPlay = () => {
  console.log("播放");
  playIndex.value = player.value.aplayer.index;
  // 播放状态
  store.setPlayerState(player.value.audioRef.paused);
  // 储存播放器信息
  store.setPlayerData(playList.value[playIndex.value].name, playList.value[playIndex.value].artist);
  ElMessage({
    message: store.getPlayerData.name + " - " + store.getPlayerData.artist,
    grouping: true,
    icon: h(MusicOne, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};
// 暂停
const onPause = () => {
  store.setPlayerState(player.value.audioRef.paused);
};
// 音频时间更新事件
const onTimeUp = () => {
  let lyrics = player.value.aplayer.lyrics[playIndex.value];
  let lyricIndex = player.value.aplayer.lyricIndex;
  if (!lyrics || !lyrics[lyricIndex]) {
    return;
  }
  let lrc = lyrics[lyricIndex][1];
  if (lrc === "Loading") {
    lrc = "歌词加载中";
  } else if (lrc === "Not available") {
    lrc = "歌词加载失败";
  }
  store.setPlayerLrc(lrc);
};
// 切换播放暂停事件
const playToggle = () => {
  player.value.toggle();
};
// 切换音量事件
const changeVolume = (value) => {
  player.value.setVolume(value, false);
};
// 切换上下曲
const changeSong = (type) => {
  type === 0 ? player.value.skipBack() : player.value.skipForward();
  nextTick(() => {
    player.value.play();
  });
};
// 切换歌曲列表状态
const toggleList = () => {
  player.value.toggleList();
};
// 加载音频错误
const loadMusicError = () => {
  let notice = "";
  if (playList.value.length > 1) {
    notice = "播放歌曲出现错误，播放器将在 2s 后进行下一首";
  } else {
    notice = "播放歌曲出现错误";
  }
  ElMessage({
    message: notice,
    grouping: true,
    icon: h(PlayWrong, {
      theme: "filled",
      fill: "#EFEFEF",
      duration: 2000,
    }),
  });
  console.error(
    "播放歌曲: " + player.value.aplayer.audio[player.value.aplayer.index].name + " 出现错误",
  );
};
// 展开面板并打开歌单
const openMusicPanel = () => {
  isExpand.value = true
  nextTick(() => {
    player.value.toggleList()
  })
}
// 切换展开/收起
const toggleExpand = () => {
  isExpand.value = !isExpand.value
}

// 暴露子组件方法
defineExpose({ playToggle, changeVolume, changeSong, toggleList, toggleExpand, openMusicPanel });
</script>

<style lang="scss" scoped>
.player-float {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 999;
  color: #efefef;

  // 永久隐藏的播放器内核，只保留功能不显示
  .player-hidden {
    display: none;
  }

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

    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;

      &.rotating {
        animation: rotate 10s linear infinite;
      }
    }
  }

  // 展开面板
  .expand-panel {
    width: 340px;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 0 4px;

      .title {
        font-size: 14px;
        font-weight: 500;
      }

      .fold-text {
        font-size: 12px;
        opacity: 0.7;
        cursor: pointer;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

// 原有 APlayer 样式全部保留，仅调整宽度适配
.aplayer {
  width: 100%;
  border-radius: 6px;
  font-family: "HarmonyOS_Regular", sans-serif !important;
  :deep(.aplayer-body) {
    background-color: transparent;
    .aplayer-pic {
      display: none;
    }
    .aplayer-info {
      margin-left: 0;
      background-color: #ffffff40;
      border-color: transparent !important;
      .aplayer-music {
        flex-grow: initial;
        margin-bottom: 2px;
        overflow: initial;
        .aplayer-title {
          font-size: 16px;
          margin-right: 6px;
        }
        .aplayer-author {
          color: #efefef;
        }
      }
      .aplayer-lrc {
        text-align: left;
        margin: 7px 0 6px 6px;
        height: 44px;
        mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        -webkit-mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        &::before,
        &::after {
          display: none;
        }
        p {
          color: #efefef;
        }
        .aplayer-lrc-current {
          font-size: 0.95rem;
          margin-bottom: 4px !important;
        }
      }
      .aplayer-controller {
        display: flex;
      }
    }
  }
  :deep(.aplayer-list) {
    margin-top: 6px;
    height: v-bind(listHeight);
    background-color: transparent;
    ol {
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      li {
        border-color: transparent;
        &.aplayer-list-light {
          background: #ffffff40;
          border-radius: 6px;
        }
        &:hover {
          background: #ffffff26 !important;
          border-radius: 6px !important;
        }
        .aplayer-list-index,
        .aplayer-list-author {
          color: #efefef;
        }
      }
    }
  }
}
</style>
