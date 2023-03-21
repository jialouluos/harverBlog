
import dayImg from "@/assets/images/day.png";
import nightImg from "@/assets/images/night.png";
export default (theme: "night" | "day") => {
    if (theme === "day") {
        /**
         * 50#e1f5fe
            100 #b3e5fc
            200 #81d4fa
            300 #4fc3f7
            400 #29b6f6
            500 #03a9f4
            600 #039be5
            700 #0288d1
            800 #0277bd
            900 #01579b
            A100 #80d8ff
            A200 #40c4ff
            A400 #00b0ff
            A700 #0091ea
         */
        /**
         * 50 #fafafa
            100 #f5f5f5
            200 #eeeeee
            300 #e0e0e0
            400 #bdbdbd
            500 #9e9e9e
            600 #757575
            700 #616161
            800 #424242
            900 #212121
         */
        document.documentElement.style.setProperty(`--hover_color`, '#03a9f4');//鼠标悬浮颜色
        document.documentElement.style.setProperty(`--bg_color`, '#eeeeee');//背景主色
        document.documentElement.style.setProperty(`--main_opacity_color`, '#eeeeeeb3');//主色透明度
        document.documentElement.style.setProperty(`--font_main_color`, '#212121'); //字体主色
        document.documentElement.style.setProperty(`--font_second_color`, '#424242'); //字体第二主色
        document.documentElement.style.setProperty(`--font_third_color`, '#616161'); //字体第三主色
        document.documentElement.style.setProperty(`--main_color`, '#fafafa');//主色
        document.documentElement.style.setProperty(`--main_second_color`, '#f5f5f5');//第二主色
        document.documentElement.style.setProperty(`--shadow_color`, '#0000001a');//阴影主色
        document.documentElement.style.setProperty(`--shadow_second_color`, '#0288d1');//第二阴影颜色
        document.documentElement.style.setProperty(`--border_color`, '#959595');//边框主色
        document.documentElement.style.setProperty(`--bg_image`, `url(${dayImg})`);//背景图片
    } else {
        document.documentElement.style.setProperty(`--hover_color`, '#ab47bc');//鼠标悬浮颜色
        document.documentElement.style.setProperty(`--font_main_color`, '#f5f5f5'); //字体主色
        document.documentElement.style.setProperty(`--font_second_color`, '#f5f5f5'); //字体第二主色
        document.documentElement.style.setProperty(`--font_third_color`, '#eeeeee'); //字体第三主色
        document.documentElement.style.setProperty(`--main_color`, '#4a4a4a');//主色
        document.documentElement.style.setProperty(`--main_second_color`, '#424242');//第二主色
        document.documentElement.style.setProperty(`--main_opacity_color`, '#4a4a4ab3');//主色透明度
        document.documentElement.style.setProperty(`--bg_color`, '#303030');//背景主色
        document.documentElement.style.setProperty(`--shadow_color`, '#9f9f9f');//阴影主色
        document.documentElement.style.setProperty(`--shadow_second_color`, '#512da8');//第二阴影颜色
        document.documentElement.style.setProperty(`--border_color`, '#8b8b8b');//边框主色
        document.documentElement.style.setProperty(`--bg_image`, `url(${nightImg})`);//背景图片
    }
};