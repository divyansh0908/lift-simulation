let lifts = [];
let q = [];
let input_floors = document.getElementById("input-floors");
let input_lifts = document.getElementById("input-lifts");
let container = document.getElementById("container");
let no_of_floors;
let no_of_lifts;
let intervalId;
let tempInterval;
let pressedButtonQueue = [];

let form = document.getElementById("form");
form.addEventListener("click", function (e) {
  e.preventDefault();
});

// Function to create lift objects and add them to the DOM
function createLifts(numberOfLifts) {
  lifts = []; // Reset lifts array
  for (let i = 1; i <= numberOfLifts; i++) {
    let lift = document.createElement("div");
    lift.className = "lift";
    lift.id = "l" + i;
    let left_door = document.createElement("div");
    let right_door = document.createElement("div");
    left_door.classList.add("lift__door", "lift__door-left");
    right_door.classList.add("lift__door", "lift__door-right");
    left_door.id = "left_door" + i;
    right_door.id = "right_door" + i;
    if (window.innerWidth < 900) {
      lift.style.left = `${15 + 45 * (i - 1)}%`;
    } else {
      lift.style.left = `${5 + 10 * i}%`;
    }
    lift.appendChild(left_door);
    lift.appendChild(right_door);

    // Store lift details
    let liftObj = {
      id: i,
      lift: lift,
      currentFloor: 1, // Lifts start on floor 1 by default
      moving: false,
    };
    lifts.push(liftObj);
  }
}

// Function to create a floor and add control buttons
function createFloor(floorNumber) {
  let floorDiv = document.createElement("div");
  floorDiv.className = "floor";
  floorDiv.id = "floor" + floorNumber;

  // Create Up and Down buttons for the floor
  let upButton = document.createElement("button");
  let downButton = document.createElement("button");
  upButton.textContent = "Up";
  downButton.textContent = "Down";
  upButton.classList.add("control-btn", "control-btn--up");
  downButton.classList.add("control-btn", "control-btn--down");
  upButton.id = "up" + floorNumber;
  downButton.id = "down" + floorNumber;

  // Create a label to show the floor number
  let floorLabel = document.createElement("span");
  floorLabel.className = "floor__number";
  let new_hr = document.createElement("hr");
  new_hr.className = "hr";
  new_hr.id = "hr" + floorNumber;
  const width = window.innerWidth;
  // give the width of the hr according to the number of lifts
  console.log("width", width, no_of_lifts);
  if (window.innerWidth < 900) {
    const required_width = 15 + 45 * no_of_lifts;
    new_hr.style.width = required_width + "%";
  } else {
    const required_width = 5 + 15 * no_of_lifts;
    new_hr.style.width = required_width + "%";
  }

  // Disable the Up button if the floor is the top floor
  if (floorNumber === parseInt(no_of_floors)) {
    upButton.disabled = true;
  }

  // Disable the Down button if the floor is the bottom floor
  if (floorNumber === 1) {
    downButton.disabled = true;
  }

  // Add all elements to the floor
  floorDiv.appendChild(upButton);
  floorDiv.appendChild(document.createElement("br"));
  floorDiv.appendChild(downButton);
  floorDiv.appendChild(floorLabel);
  floorDiv.appendChild(new_hr);

  // Add the floor to the container (insert at the top)
  container.insertBefore(floorDiv, container.firstChild);
}

function closeDoor(e) {
  console.log("closeDoor", q);
  let target_id = e.target.id;
  console.log("closeDoor", target_id);
  let lift_no = target_id[target_id.length - 1];
  let left_door = document.getElementById("left_door" + lift_no);
  let right_door = document.getElementById("right_door" + lift_no);
  right_door.removeEventListener("webkitTransitionEnd", closeDoor);
  left_door.style.transform = `translateX(0)`;
  right_door.style.transform = `translateX(0)`;
  left_door.style.transition = `all 2.5s ease-out`;
  right_door.style.transition = `all 2.5s ease-out`;
  setTimeout(() => {
    stop_lift(lift_no);
  }, 2500);
}

function stop_lift(lift_no) {
  console.log("stop_lift");
  for (lft of lifts) {
    if (lft.id == lift_no) {
      lft.moving = false;
    }
  }
}

function doorAnimation(e) {
  console.log("doorAnimation");
  let target_id = e.target.id;
  // NOTE :- BAD ASSUMPTION , MAX LIFTS = 9
  let lift_no = target_id[target_id.length - 1];
  let lift = document.getElementById("l" + lift_no);
  lift.removeEventListener("webkitTransitionEnd", doorAnimation);
  let left_door = document.getElementById("left_door" + lift_no);
  let right_door = document.getElementById("right_door" + lift_no);
  left_door.removeEventListener("webkitTransitionEnd", doorAnimation);
  right_door.removeEventListener("webkitTransitionEnd", doorAnimation);
  right_door.addEventListener("webkitTransitionEnd", closeDoor);
  left_door.style.transform = `translateX(-100%)`;
  right_door.style.transform = `translateX(100%)`;
  left_door.style.transition = `all 2.5s ease-out`;
  right_door.style.transition = `all 2.5s ease-out`;
}

function scheduledLift(floor) {
  console.log("scheduledLift", q);
  let selected_lift;
  let min_distance = Infinity;

  for (lift of lifts) {
    if (!lift.moving && Math.abs(floor - lift.currentFloor) < min_distance) {
      min_distance = Math.abs(floor - lift.currentFloor);
      selected_lift = lift;
    }
  }
  return selected_lift;
}

/** */
function moveLift(lift, to) {
  console.log("moveLift", { lift, to });
  let distance = -1 * (to - 1) * 100;
  let lift_no = lift.id;
  let from = lift.currentFloor;
  lift.currentFloor = to;
  lift.moving = true;
  let lft = lift.lift;
  lft.addEventListener("webkitTransitionEnd", doorAnimation);
  lft.style.transform = `translateY(${distance}%)`;
  let time = 2 * Math.abs(from - to);
  if (time === 0) {
    let e = {};
    e.target = {};
    e.target.id = `l${lift_no}`;
    doorAnimation(e);
  }
  setTimeout(() => {
    document.getElementById(pressedButtonQueue[0]).disabled = false;
    pressedButtonQueue.shift();
  }, time * 1000 + 4000);

  lft.style.transitionDuration = `${time}s`;
}

function save_click(e) {
  let clicked_on = e.target.id;
  let n;
  console.log("save_click", n, clicked_on);
  if (clicked_on.startsWith("up")) {
    n = Number(clicked_on.substring(2, clicked_on.length));
    document.getElementById("up" + n).disabled = true;
    pressedButtonQueue.push("up" + n);
  } else if (clicked_on.startsWith("down")) {
    n = Number(clicked_on.substring(4, clicked_on.length));
    document.getElementById("down" + n).disabled = true;
    pressedButtonQueue.push("down" + n);
    // enable after reaching the floor
  }
  q.push(n);
}

function getButtons() {
  let up_btn_list = document.getElementsByClassName("control-btn--up");
  let down_btn_list = document.getElementsByClassName("control-btn--down");
  for (up_btn of up_btn_list) {
    up_btn.addEventListener("click", save_click);
  }
  for (down_btn of down_btn_list) {
    down_btn.addEventListener("click", save_click);
  }
}

function make_lifts() {
  no_of_lifts = input_lifts.value;
  if (parseInt(no_of_lifts) < 1) {
    return;
  }
  createLifts(no_of_lifts);
  for (lft of lifts) {
    let lift = lft.lift;
    lift.style.transform = null;
    lift.style.transitionDuration = null;
  }
}

function make_floors() {
  container.innerHTML = "";
  no_of_floors = input_floors.value;
  if (parseInt(no_of_floors) < 1) {
    return;
  }

  for (let i = 1; i <= no_of_floors; i++) {
    createFloor(i);
  }
}

function place_lifts() {
  let first_floor = document.getElementById("floor1");
  for (let i = lifts.length - 1; i >= 0; i--) {
    first_floor.insertBefore(
      lifts[i].lift,
      first_floor.childNodes[first_floor.childNodes.length - 1]
    );
  }
}

function check_for_scheduling() {
  if (q.length === 0) return;
  floor = q.shift();
  let lift = scheduledLift(floor);
  console.log("scheduling", { lift, floor, q });
  if (!lift) {
    q.unshift(floor);
    return;
  }
  console.log("jjj", { lift, floor, q });
  moveLift(lift, floor);
}

function start() {
  clearInterval(intervalId);
  q = [];
  lifts = [];
  // if not a natural number, return and alert
  if (!parseInt(input_floors.value) || !parseInt(input_lifts.value)) {
    alert("Please enter valid values");
    return;
  }
  if (parseInt(input_floors.value) < 1 || parseInt(input_lifts.value) < 1) {
    alert("Please enter valid values");
    return;
  }
  make_floors();
  make_lifts();
  place_lifts();
  getButtons();
  container.style.display = "block";
  intervalId = setInterval(check_for_scheduling, 100);
}

let input_btn = document.getElementById("input-btn");
input_btn.addEventListener("click", start);
