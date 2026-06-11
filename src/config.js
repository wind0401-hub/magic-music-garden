export const BABY_NAME = 'Emi'

export const GAME_DURATION = 3 * 60 // 3 phút tính bằng giây

export const GAME_CONFIG = {
  gravity: 0.5,
  jumpForce: -11,
  groundY: 75,
  playerX: 18,
  playerSize: 80,
  gameSpeed: 3,
  speedIncrement: 0.3,
  obstacleInterval: 2200,
  starInterval: 3000,
}

export const SPEECHES = {
  start: `Bắt đầu nào Emi, chạm vào màn hình để nhảy nhé!`,
  jump: [`Emi giỏi quá!`, `Nhảy cao quá!`, `Tuyệt vời!`],
  collectStar: [`Yay! Emi lấy được sao rồi!`, `Thêm một ngôi sao!`, `Giỏi lắm!`],
  hit: [`Ôi! Đứng dậy nào Emi!`, `Không sao đâu, tiếp tục nào!`],
  encouragement: [`Emi chạy giỏi lắm!`, `Cố lên Emi!`, `Tuyệt lắm!`],
  win: `Emi thắng rồi! Giỏi quá!`,
}
