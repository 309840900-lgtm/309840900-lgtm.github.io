<template>
  <div class="weather" v-if="weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { getWeather } from "@/api";
import { reactive, onMounted, h } from "vue";
import { Error } from "@icon-park/vue-next";

// 天气数据结构保持和原模板一致
const weatherData = reactive({
  adCode: {
    city: null,
  },
  weather: {
    weather: null,
    temperature: null,
    winddirection: null,
    windpower: null,
  },
});

// 获取天气数据
const getWeatherData = async () => {
  try {
    // 直接通过 Cloudflare Worker 代理查询固定城市天气
    // 把 "武汉" 换成你所在的城市即可
    const result = await getWeather("武汉");
    
    // 高德实况天气数据在 lives 数组第一项中
    const live = result.lives[0];
    weatherData.adCode.city = live.city;
    weatherData.weather = {
      weather: live.weather,
      temperature: live.temperature,
      winddirection: live.winddirection,
      windpower: live.windpower,
    };
  } catch (error) {
    console.error("天气信息获取失败:" + error);
    onError("天气信息获取失败");
  }
};

// 报错提示
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

onMounted(() => {
  getWeatherData();
});
</script>
