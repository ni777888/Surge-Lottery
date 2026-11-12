# Surge iOS 6 体彩福彩开奖助手

远程模块地址：
https://raw.githubusercontent.com/ni777888/Surge-Lottery/main/Lottery.sgmodule

文件：
- Lottery.sgmodule：远程模块
- lottery-panel.js：开奖面板
- lottery-notify.js：独立通知脚本

支持彩种：双色球、快乐8、福彩3D、七乐彩、超级大乐透、排列3、排列5、7星彩。

数据源：
- 福彩：中国福彩网官方开奖查询 JSON 接口。
- 体彩：中国体彩网官方开奖历史 JSON 接口。

注意：
- 脚本对期号和号码数量做校验；无法核实的数据会显示错误，不会用模拟号码填充。
- 福彩接口可能要求有效会话 Cookie，网站接口参数或字段变化时可能读取失败。
- 首次通知运行建立期号基线，之后检测到期号变化才通知。
- Cron 每30分钟运行一次，但 iOS 后台调度不保证绝对准点。
- 已上传脚本尚未在你的 Surge iOS 6 设备上实机验证，请安装后先检查面板各彩种的接口状态。
