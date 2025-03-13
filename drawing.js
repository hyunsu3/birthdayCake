// 📌 "💾 카드 저장" 버튼 추가
const saveButton = document.createElement("button");
saveButton.innerText = "💾 카드 저장";
saveButton.style.display = "none"; // 처음에는 숨김
saveButton.style.marginLeft = "10px";
saveButton.style.padding = "10px 20px";
saveButton.style.fontSize = "18px";
saveButton.style.border = "none";
saveButton.style.borderRadius = "10px";
saveButton.style.background = "linear-gradient(135deg, #4CAF50, #388E3C)";
saveButton.style.color = "white";
saveButton.style.cursor = "pointer";
saveButton.style.transition = "0.3s";
saveButton.onclick = saveCanvasAsImage; // 클릭 시 이미지 저장 함수 실행
document.body.appendChild(saveButton);

// 📌 메시지 선택 후 업로드 버튼과 저장 버튼을 표시하는 함수
function showUploadAndSaveButtons() {
  uploadButton.style.display = "block"; // 📷 업로드 버튼 보이기
  saveButton.style.display = "block"; // 💾 저장 버튼 보이기
}

// 📌 메시지 버튼 클릭 시 실행되는 부분 수정
function showMessageOptions() {
  messageContainer.innerHTML = ""; // 기존 버튼 삭제 후 재생성
  messageContainer.style.display = "block"; // 메시지 버튼 보이기

  messages.forEach((msg) => {
    const messageButton = document.createElement("button");
    messageButton.innerText = msg;
    messageButton.style.margin = "10px";
    messageButton.style.padding = "10px 20px";
    messageButton.style.fontSize = "18px";
    messageButton.style.border = "none";
    messageButton.style.borderRadius = "10px";
    messageButton.style.background = "linear-gradient(135deg, #ff7eb3, #ff758c)";
    messageButton.style.color = "white";
    messageButton.style.cursor = "pointer";
    messageButton.style.transition = "0.3s";

    messageButton.onmouseover = () => {
      messageButton.style.background = "linear-gradient(135deg, #ff9eb3, #ff95ac)";
    };
    messageButton.onmouseleave = () => {
      messageButton.style.background = "linear-gradient(135deg, #ff7eb3, #ff758c)";
    };

    // 🔹 메시지 선택 시 업로드 & 저장 버튼 보이기
    messageButton.onclick = () => {
      selectedMessage.innerText = msg;
      showUploadAndSaveButtons(); // 📷 사진 업로드 & 💾 저장 버튼 표시
    };

    messageContainer.appendChild(messageButton);
  });
}

// 📌 캔버스를 PNG 이미지로 저장하는 함수
function saveCanvasAsImage() {
  const canvas = document.getElementById("cakeCanvas");
  const ctx = canvas.getContext("2d");

  // 현재 캔버스 상태 저장
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");

  // 배경 먼저 그리기
  drawBackground(tempCtx);

  // 기존 캔버스 내용을 tempCanvas로 복사
  tempCtx.drawImage(canvas, 0, 0);

  // 선택된 메시지 추가
  if (selectedMessage.innerText) {
    tempCtx.font = "42px 'Noto Serif KR', serif";
    tempCtx.fillStyle = "#D72638"; // 따뜻한 레드 계열
    tempCtx.textAlign = "center";
    tempCtx.fillText(selectedMessage.innerText, canvas.width / 2, canvas.height - 30);
  }

  // 캔버스를 이미지로 변환 & 다운로드
  const link = document.createElement("a");
  link.href = tempCanvas.toDataURL("image/png");
  link.download = "birthday_card.png";
  link.click();
}
