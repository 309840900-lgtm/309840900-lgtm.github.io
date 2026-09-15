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

// 兜底默认城市，获取失败自动回退到这里
const FALLBACK_CITY = "武汉";

// 尝试IP定位获取用户所在城市，失败直接返回兜底城市
const getUserCity = async () => {
  try {
    const controller = new AbortController();
    // 3秒超时，避免卡太久
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await fetch("https://ipapi.co/json/", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    return data.city || FALLBACK_CITY;
  } catch {
    return FALLBACK_CITY;
  }
};

const getWeatherData = async () => {
  try {
    // 第一步：先尝试获取用户真实城市并查天气
    const city = await getUserCity();
    const result = await getWeather(city);
    
    const live = result.lives?.[0];
    if (!live) throw new Error("数据格式异常");

    weatherData.adCode.city = live.city;
    weatherData.weather = {
      weather: live.weather,
      temperature: live.temperature,
      winddirection: live.winddirection,
      windpower: live.windpower,
    };
  } catch (error) {
    console.warn("首次获取失败，降级使用默认城市重试", error);
    try {
      // 第二步：兜底重试，直接用武汉查询
      const result = await getWeather(FALLBACK_CITY);
      const live = result.lives?.[0];
      if (!live) throw new Error("兜底请求也失败了");

      weatherData.adCode.city = live.city;
      weatherData.weather = {
        weather: live.weather,
        temperature: live.temperature,
        winddirection: live.winddirection,
        windpower: live.windpower,
      };
    } catch (finalError) {
      console.error("天气信息获取失败:", finalError);
      onError("天气信息获取失败");
    }
  }
};

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
