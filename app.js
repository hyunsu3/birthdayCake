// 🔹 초 관련 변수들 선언
let candles = []; // 초 객체를 저장하는 배열
let draggingCandle = null; // 현재 드래그 중인 초를 저장
let offsetX = 0,
  offsetY = 0; // 마우스 클릭 또는 터치 위치 보정값
let cakeY, cakeWidth, cakeHeight; // 케이크의 위치와 크기
let moveCount = 0; // 초가 움직일 때마다 증가하는 카운트 (우선순위 정렬용)

// 📌 캔버스 크기 조정 (화면 크기에 맞춰 조절)
function adjustCanvasSize() {
  const canvas = document.getElementById("cakeCanvas");
  // canvas.width = window.innerWidth * 0.8;
  canvas.width = Math.min(window.innerWidth * 0.8, 600); // 최대 600px
  canvas.height = window.innerHeight * 0.6;
}

// 📌 촛불 색상을 밝은 파스텔 색상으로 설정
function getBrightPastelColors() {
  return ["#FF6666", "#FF9966", "#FFCC66", "#66CC99", "#6699FF"];
}

// 🔹 케이크 위에 표시할 텍스트 요소 생성
const cakeTopText = document.createElement("div");
cakeTopText.style.position = "absolute";
cakeTopText.style.top = "19%"; // 케이크 위쪽
cakeTopText.style.width = "100%";
cakeTopText.style.textAlign = "center";
cakeTopText.style.fontSize = "50px"; // 크기 조절
cakeTopText.style.letterSpacing = "-10%"; // 크기 조절
cakeTopText.style.fontFamily = "'Noto Serif KR', serif"; // 폰트 적용
cakeTopText.style.fontWeight = "500";
cakeTopText.style.color = "yellow"; // 어두운 회색
cakeTopText.style.textShadow = "1px 1px 5px rgba(0,0,0,0.2)"; // 부드러운 그림자 효과
document.body.appendChild(cakeTopText);

// 📌 생년월일을 변형하여 현재 연도와 함께 표시하는 함수
function updateCakeTopText(birthdate) {
  if (!/^\d{8}$/.test(birthdate)) return;

  const currentYear = new Date().getFullYear(); // 현재 연도 가져오기
  const birthMonth = birthdate.substring(4, 6); // 월 추출
  const birthDay = birthdate.substring(6, 8); // 일 추출

  // 🔹 변형된 생일 텍스트 생성 (현재 연도 기준으로 변형)
  cakeTopText.innerText = `${currentYear}. ${birthMonth}. ${birthDay}`;
}

// 📌 생년월일을 입력받아 한국 나이를 계산하고 초를 배치하는 함수
function setupCandles() {
  const input = document.getElementById("birthdate").value;

  if (!/^\d{8}$/.test(input)) {
    alert("올바른 생년월일을 8자리로 입력하세요.");
    return;
  }
  // 🔹 모든 요소 초기화 (배경, 메시지, 버튼)
  uploadedImage = null; // 배경 이미지 리셋
  selectedMessage.innerText = ""; // 선택된 메시지 리셋
  messageContainer.innerHTML = ""; // 메시지 버튼 삭제
  messageContainer.style.display = "none"; // 메시지 버튼 숨기기
  uploadButton.style.display = "none"; // 업로드 버튼 숨기기

  updateCakeTopText(input); // 🔹 입력값을 변형하여 케이크 위쪽에 표시

  // 생년월일을 기반으로 한국 나이 계산
  const birthYear = parseInt(input.substring(0, 4));
  const today = new Date();
  const currentYear = today.getFullYear();
  let koreanAge = currentYear - birthYear + 1;

  let longCandles = Math.floor(koreanAge / 10); // 🔹 십의 자리 초 개수
  let shortCandles = koreanAge % 10; // 🔹 일의 자리 초 개수
  let totalCandles = longCandles + shortCandles; // 🔹 총 초 개수

  adjustCanvasSize();
  const canvas = document.getElementById("cakeCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 🔹 배경 이미지 리셋 (사용자가 다시 업로드해야 함)
  uploadedImage = null;

  // 🔹 기본 배경색 적용
  drawBackground(ctx);
  drawCake(ctx, canvas, totalCandles);

  candles = [];
  const colors = getBrightPastelColors();
  const startX = canvas.width * 0.1;
  const gap = (canvas.width * 0.8) / totalCandles;
  const baseY = canvas.height - 40;

  // 📌 초 생성 및 배치
  for (let i = 0; i < totalCandles; i++) {
    const isLong = i < longCandles; // 🔹 긴 초인지 확인
    candles.push({
      x: startX + i * gap,
      y: baseY,
      height: (isLong ? 50 : 30) * 3, // 🔹 초 길이를 2배 증가
      width: 17,
      dragArea: 20,
      color: isLong ? "red" : colors[i % colors.length], // 🔹 긴 초는 빨간색, 나머지는 파스텔색
      zIndex: i, // 🔹 초가 이동될 때 우선순위를 조정하기 위한 값
      isLit: false, // 🔹 불이 켜졌는지 여부
      wasLit: false, // 🔹 이전에 불이 켜졌는지 여부 (드래그 시 불 유지)
      flickerOffsetX: 0,
      flickerOffsetY: 0,
    });
  }

  drawCandles(ctx);
}

// 📌 케이크를 그리는 함수 (초가 많으면 크기 조정)
function drawCake(ctx, canvas, totalCandles) {
  const cakeX = canvas.width / 2;
  cakeY = canvas.height * 0.7;
  cakeWidth = totalCandles > 10 ? canvas.width * 0.7 : canvas.width * 0.5; // 🔹 초 개수 10개 이상이면 더 큰 케이크
  cakeHeight = totalCandles > 10 ? canvas.height * 0.17 : canvas.height * 0.2;

  // 케이크 본체 그리기
  ctx.fillStyle = "#D2691E";
  ctx.fillRect(cakeX - cakeWidth / 2, cakeY - cakeHeight, cakeWidth, cakeHeight + 3);
  ctx.beginPath();
  ctx.ellipse(cakeX, cakeY, cakeWidth / 2, cakeHeight / 3, 0, 0, Math.PI);
  ctx.fill();

  // 케이크 윗면
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.ellipse(cakeX, cakeY - cakeHeight, cakeWidth / 2, cakeHeight / 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

// // 📌 초(캔들)를 그리는 함수 (속불꽃을 주황색으로 추가)
// function drawCandles(ctx) {
//   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//   drawCake(ctx, ctx.canvas, candles.length);

//   // 🔹 초를 zIndex 기준으로 정렬 (최근 이동한 초가 위로 감)
//   candles.sort((a, b) => a.zIndex - b.zIndex);

//   for (let candle of candles) {
//     // 🔥 초 본체
//     ctx.fillStyle = candle.color;
//     ctx.fillRect(candle.x - candle.width / 2, candle.y - candle.height, candle.width, candle.height);

//     // 🔥 심지
//     ctx.fillStyle = "beige";
//     ctx.fillRect(candle.x - 1, candle.y - candle.height - 10, 2, 10);

//     // 🔥 촛불 (속불꽃: 주황색, 겉불꽃: 금색)
//     if (candle.isLit) {
//       updateFlickerEffect(candle);

//       // 겉불꽃 (금색, 더 큰 원)
//       ctx.fillStyle = "gold";
//       ctx.beginPath();
//       ctx.ellipse(candle.x + candle.flickerOffsetX, candle.y - candle.height - 10 + candle.flickerOffsetY, 10 + Math.random() * 2, 16 + Math.random() * 2, 0, 0, Math.PI * 2);
//       ctx.fill();

//       // 속불꽃 (주황색, 더 작은 원)
//       ctx.fillStyle = "orange";
//       ctx.beginPath();
//       ctx.ellipse(
//         candle.x + candle.flickerOffsetX,
//         candle.y - candle.height - 10 + candle.flickerOffsetY + 5,
//         6 + Math.random() * 1.5, // 크기 변동
//         10 + Math.random() * 1.5,
//         0,
//         0,
//         Math.PI * 2
//       );
//       ctx.fill();
//     }
//   }

//   requestAnimationFrame(() => drawCandles(ctx));
// }

// 🔹 업로드된 이미지를 저장할 변수
let uploadedImage = null;
// // 📌 파일 업로드 입력 필드 추가 (이미지를 선택할 input 요소)
// const uploadInput = document.createElement("input");
// uploadInput.type = "file";
// uploadInput.accept = "image/*";
// uploadInput.style.display = "none"; // 기본적으로 숨김
// document.body.appendChild(uploadInput);

// // 📌 생일자 사진 업로드 버튼 (변수명 수정)
// const uploadButton = document.createElement("button");
// uploadButton.innerText = "📷 생일자 사진 업로드";
// uploadButton.style.display = "none"; // 메시지 선택 전에는 숨김
// uploadButton.style.marginTop = "20px";
// uploadButton.style.padding = "10px 20px";
// uploadButton.style.fontSize = "18px";
// uploadButton.style.border = "none";
// uploadButton.style.borderRadius = "10px";
// uploadButton.style.background = "linear-gradient(135deg, #6A11CB, #2575FC)";
// uploadButton.style.color = "white";
// uploadButton.style.cursor = "pointer";
// uploadButton.style.transition = "0.3s";
// uploadButton.onclick = () => {
//   if (uploadInput) {
//     uploadInput.click(); // 파일 업로드 창 열기
//   } else {
//     console.error("uploadInput is not defined");
//   }
// };
// document.body.appendChild(uploadButton);

// 📌 파일 업로드 입력 필드 추가 (이미지를 선택할 input 요소)
const uploadInput = document.createElement("input");
uploadInput.type = "file";
uploadInput.accept = "image/*";
uploadInput.style.display = "none"; // 기본적으로 숨김
document.body.appendChild(uploadInput);

// 📌 생일자 사진 업로드 버튼 (변수명 명확히 설정)
const uploadButton = document.createElement("button");
uploadButton.innerText = "📷 생일자 사진 업로드";
uploadButton.style.display = "none"; // 메시지 선택 전에는 숨김
uploadButton.style.marginTop = "20px";
uploadButton.style.padding = "10px 20px";
uploadButton.style.fontSize = "18px";
uploadButton.style.border = "none";
uploadButton.style.borderRadius = "10px";
uploadButton.style.background = "linear-gradient(135deg, #6A11CB, #2575FC)";
uploadButton.style.color = "white";
uploadButton.style.cursor = "pointer";
uploadButton.style.transition = "0.3s";

// ✅ 업로드 버튼 클릭 시 input을 트리거 (변수 접근 오류 해결)
uploadButton.onclick = () => {
  uploadInput.click();
};

// 📌 업로드 버튼을 body에 추가
document.body.appendChild(uploadButton);

// 📌 메시지 버튼 클릭 후 업로드 버튼 표시
function showUploadButton() {
  uploadButton.style.display = "block"; // 📷 업로드 버튼 활성화
}

// 📌 이미지 업로드 후 배경 설정
uploadInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedImage = new Image();
      uploadedImage.src = e.target.result;
      uploadedImage.onload = function () {
        console.log("이미지 업로드 완료, 캔버스 다시 그리기!");
        drawCandles(document.getElementById("cakeCanvas").getContext("2d")); // 캔버스 다시 그리기
      };
    };
    reader.readAsDataURL(file);
  }
});

// // 📌 배경을 캔버스에 그리는 함수
// function drawBackground(ctx) {
//   if (uploadedImage) {
//     ctx.drawImage(uploadedImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
//   } else {
//     ctx.fillStyle = "#FFF5E1"; // 기본 배경색 (따뜻한 연한 베이지)
//     ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//   }
// }

// 📌 배경을 캔버스에 그리는 함수 (배경 이미지 없으면 기본색)
function drawBackground(ctx) {
  if (uploadedImage) {
    ctx.drawImage(uploadedImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    ctx.fillStyle = "#2575FC"; // 다저스 블루
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

// 📌 캔들 그리는 함수 수정 (배경 추가)
function drawCandles(ctx) {
  drawBackground(ctx); // 🔹 배경 먼저 그림
  drawCake(ctx, ctx.canvas, candles.length);

  candles.sort((a, b) => a.zIndex - b.zIndex);
  for (let candle of candles) {
    ctx.fillStyle = candle.color;
    ctx.fillRect(candle.x - candle.width / 2, candle.y - candle.height, candle.width, candle.height);

    // 🔥 심지
    ctx.fillStyle = "beige";
    ctx.fillRect(candle.x - 1, candle.y - candle.height - 10, 2, 10);

    // 🔥 촛불 (겉불꽃 → 속불꽃 순서로 그리기)
    if (candle.isLit) {
      updateFlickerEffect(candle);

      // 겉불꽃 (gold)
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.ellipse(candle.x + candle.flickerOffsetX, candle.y - candle.height - 10 + candle.flickerOffsetY, 10 + Math.random() * 2, 16 + Math.random() * 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // 속불꽃 (orange)
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.ellipse(candle.x + candle.flickerOffsetX, candle.y - candle.height - 10 + candle.flickerOffsetY, 6 + Math.random() * 1.5, 10 + Math.random() * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(() => drawCandles(ctx));
}

// 📌 촛불이 어른거리는 애니메이션 효과
function updateFlickerEffect(candle) {
  candle.flickerOffsetX = (Math.random() - 0.5) * 3;
  candle.flickerOffsetY = (Math.random() - 0.5) * 2 - 10;
}

// 📌 마우스 포인터 위치 가져오기
function getMousePosition(event) {
  const canvas = document.getElementById("cakeCanvas");
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

// 📌 초 드래그 시작
function startDrag(event) {
  if (candles.length === 0) return;

  const { x, y } = getMousePosition(event);
  for (let candle of candles.reverse()) {
    if (
      x > candle.x - candle.width / 2 - candle.dragArea &&
      x < candle.x + candle.width / 2 + candle.dragArea &&
      y > candle.y - candle.height - 10 - candle.dragArea &&
      y < candle.y + candle.dragArea
    ) {
      draggingCandle = candle;
      offsetX = x - candle.x;
      offsetY = y - candle.y;
      candle.wasLit = candle.isLit;
      candle.zIndex = ++moveCount;
      break;
    }
  }
}

// 📌 초 드래그 이동
function dragCandle(event) {
  if (!draggingCandle) return;
  const { x, y } = getMousePosition(event);
  draggingCandle.x = x - offsetX;
  draggingCandle.y = y - offsetY;
}

// // 📌 초 드래그 종료
// function stopDrag() {
//   if (!draggingCandle) return;
//   draggingCandle.isLit = draggingCandle.wasLit || draggingCandle.y < cakeY;
//   draggingCandle = null;
// }

// 📌 초 드래그 종료 함수 수정 (초 이동 후 체크)
function stopDrag() {
  if (!draggingCandle) return;
  draggingCandle.isLit = draggingCandle.wasLit || draggingCandle.y < cakeY;
  draggingCandle = null;

  checkAllCandlesOnCake(); // 초 이동 후 모든 초가 올라갔는지 확인
}

// 🔹 엔터 키 입력 시 자동 실행
document.getElementById("birthdate").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    setupCandles();
  }
});

adjustCanvasSize();

const canvas = document.getElementById("cakeCanvas");
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", dragCandle);
canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

// 🔹 엔터 키 입력 시 자동 실행
document.getElementById("birthdate").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    setupCandles();
  }
});

// 🔹 메시지 버튼을 생성할 컨테이너 추가
const messageContainer = document.createElement("div");
messageContainer.style.position = "absolute";
messageContainer.style.bottom = "20%"; // 초가 있던 위치 아래에 배치
messageContainer.style.width = "100%";
messageContainer.style.display = "none"; // 처음에는 숨김
messageContainer.style.textAlign = "center";
document.body.appendChild(messageContainer);

// 🔹 선택된 메시지를 표시할 큰 텍스트 영역 추가
const selectedMessage = document.createElement("div");
selectedMessage.style.position = "absolute";
selectedMessage.style.bottom = "33%"; // 케이크 아래쪽에 배치
selectedMessage.style.width = "100%";
selectedMessage.style.textAlign = "center";

// 🔹 선택된 메시지를 표시할 큰 텍스트 영역 스타일 수정
selectedMessage.style.fontFamily = "'Noto Serif KR', serif"; // 폰트 변경
selectedMessage.style.fontSize = "55px"; // 더 크고 강조
selectedMessage.style.fontWeight = "600"; // 볼드 효과
selectedMessage.style.color = "pink"; // 따뜻한 레드 계열 색상
selectedMessage.style.textShadow = "2px 2px 10px rgba(215, 38, 56, 0.3)"; // 부드러운 그림자 효과
document.body.appendChild(selectedMessage);

// 🔹 메시지 버튼 목록
const messages = ["생일 축하해", "Happy Birthday!", "사랑해", "축복해!"];

// 📌 메시지 버튼 생성 함수
function showMessageOptions() {
  messageContainer.innerHTML = ""; // 기존 버튼 삭제 후 재생성
  messageContainer.style.display = "block"; // 메시지 버튼 보이기

  messages.forEach((msg) => {
    const button = document.createElement("button.upload"); // 🔹 button 정의
    button.innerText = msg;
    button.style.margin = "10px";
    button.style.padding = "10px 20px";
    button.style.fontSize = "18px";
    button.style.border = "none";
    button.style.borderRadius = "10px";
    button.style.background = "linear-gradient(135deg, #ff7eb3, #ff758c)";
    button.style.color = "white";
    button.style.cursor = "pointer";
    button.style.transition = "0.3s";

    // 버튼 호버 효과 추가
    button.onmouseover = () => {
      button.style.background = "linear-gradient(135deg, #ff9eb3, #ff95ac)";
    };
    button.onmouseleave = () => {
      button.style.background = "linear-gradient(135deg, #ff7eb3, #ff758c)";
    };

    // 🔹 메시지 선택 시 업로드 버튼 표시
    button.onclick = () => {
      selectedMessage.innerText = msg;
      showUploadButton(); // 📷 사진 업로드 버튼 표시
    };

    messageContainer.appendChild(button);
  });
}

// 📌 초가 모두 케이크 위에 올라갔는지 확인하는 함수
function checkAllCandlesOnCake() {
  const allOnCake = candles.every((candle) => candle.y < cakeY);
  if (allOnCake) {
    showMessageOptions();
  }
}
