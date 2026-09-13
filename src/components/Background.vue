import { mainStore } from "@/store";
import { Error } from "@icon-park/vue-next";
import { h } from "vue"; // 这里你原来缺了h的导入！
const store = mainStore();
const bgUrl = ref(null);
const imgTimeout = ref(null);
const emit = defineEmits(["loadComplete"]);
// 壁纸随机数
// 请依据文件夹内的图片个数修改 Math.random() 后面的第一个数字
const bgRandom = Math.floor(Math.random() * 10 + 1);
// 更换壁纸链接
const changeBg = (type) => {
  if (type == 0) {
    // ✅ 修改：去掉开头 / 变成相对路径
    bgUrl.value = `images/background${bgRandom}.jpg`;
  } else if (type == 1) {
    bgUrl.value = "https://api.dujin.org/bing/1920.php";
  } else if (type == 2) {
    bgUrl.value = "https://api.vvhan.com/api/wallpaper/views";
  } else if (type == 3) {
    bgUrl.value = "https://api.vvhan.com/api/wallpaper/acg";
  }
};
// 图片加载完成
const imgLoadComplete = () => {
  imgTimeout.value = setTimeout(
    () => {
      store.setImgLoadStatus(true);
    },
    Math.floor(Math.random() * (600 - 300 + 1)) + 300,
  );
};
// 图片动画完成
const imgAnimationEnd = () => {
  console.log("壁纸加载且动画完成");
  // 加载完成事件
  emit("loadComplete");
};
// 图片显示失败
const imgLoadError = () => {
  console.error("壁纸加载失败：", bgUrl.value);
  ElMessage({
    message: "壁纸加载失败，已临时切换回默认",
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  // ✅ 新增：失败也要标记加载完成，解除页面锁死
  store.setImgLoadStatus(true);
  // ✅ 删除原来这一行：bgUrl.value = `/images/background${bgRandom}.jpg`
  // 删掉！避免无限重试加载错误图片
};
// 监听壁纸切换
watch(
  () => store.coverType,
  (value) => {
    changeBg(value);
  },
);
onMounted(() => {
  // 加载壁纸
  changeBg(store.coverType);
});
onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
});
