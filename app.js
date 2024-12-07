const video = document.getElementById("webcam");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d");
const feedbackText = document.getElementById("feedback-text");

// Load the pose detection model
async function loadModel() {
  const model = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
  return model;
}

// Start the webcam stream
async function startWebcam() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  video.srcObject = stream;
}

// Detect poses and provide feedback
async function detectPose(model) {
  const poses = await model.estimatePoses(video, { maxPoses: 1 });
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (poses.length > 0) {
    const pose = poses[0];
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Provide feedback based on pose
    if (pose.keypoints[5].y > pose.keypoints[11].y) {
      feedbackText.textContent = "Keep your back straight!";
    } else {
      feedbackText.textContent = "Good posture!";
    }
  }
}

async function main() {
  await startWebcam();
  const model = await loadModel();

  video.addEventListener("loadeddata", () => {
    setInterval(() => detectPose(model), 100);
  });
}

main();
