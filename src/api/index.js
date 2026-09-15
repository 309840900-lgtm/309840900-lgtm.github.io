// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

    export const getPlayerList = (server, type, id) => {
     return fetch(`${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`)
      .then(res => res.json())
}

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

// 获取高德地理位置信息（走Worker代理）
export const getAdcode = async () => {
  const res = await fetch("https://winter-shape-3649.309840900.workers.dev/ip");
  return await res.json();
};

// 获取高德地理天气信息（走Worker代理）
export const getWeather = async (city) => {
  const res = await fetch(`https://winter-shape-3649.309840900.workers.dev/weather?city=${city}`);
  return await res.json();
};

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = async () => {
  const res = await fetch("https://api.oioweb.cn/api/weather/GetWeather");
  return await res.json();
};
