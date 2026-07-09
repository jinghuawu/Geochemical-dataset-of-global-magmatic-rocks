# Global Igneous Geochemistry Database

这是一个基于 CSV/Excel 思路的静态 WebGIS 模板，用于展示全球岩浆岩全岩地球化学数据。

## 功能

- 全球地图显示已发表岩体点位
- 圆圈大小随样品数量变化
- 点击圆圈显示该岩体全部样品数据
- 支持按岩体名称、岩石类型、SiO2 含量筛选
- 可部署到 GitHub Pages
- 不需要数据库、不需要服务器

## 文件说明

```text
index.html   网站主页面
style.css    页面样式
script.js    地图和数据交互逻辑
data.csv     示例地球化学数据
```

## 如何使用

1. 保留表头格式，替换 `data.csv` 中的数据。
2. 每一行代表一个样品。
3. 同一个岩体的 `Pluton`、`Lat`、`Lon` 保持一致。
4. 打开 `index.html` 即可查看地图。

## 必需字段

```text
Pluton   岩体名称
Lat      纬度
Lon      经度
Sample   样品编号
RockType 岩石类型
Age_Ma   年龄，单位 Ma
Reference 文献来源
```

其他字段可以自由增加，例如：

```text
SiO2, TiO2, Al2O3, Fe2O3, FeO, MgO, CaO, Na2O, K2O, P2O5, Rb, Sr, Ba, Zr, Hf, Sn
```
