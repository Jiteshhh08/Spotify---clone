let currentSong = new Audio();
const play = document.querySelector(".play");
let songs;

//Converts duration into correct format

function secondsToMinutesSeconds(totalSeconds) {
  if(isNaN(totalSeconds) || totalSeconds < 0){
    return "00:00"
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

async function getSongs() {
  let a = await fetch("http://127.0.0.1:5500/Songs/");
  let response = await a.text();

  // console.log(response);

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  // console.log(as);

  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/Songs/")[1]);
    }
  }
  return songs;
}

const playSong = (track, pause = false) => {
  currentSong.src = "/Songs/" + track ;
  if (!pause) {
    currentSong.play();
    play.src = "Pause.svg";
  }
  document.querySelector(".song_details").innerHTML = decodeURI(track);
  document.querySelector(".song_time").innerHTML = "00:00 / 00:00";
};

async function main() {
  //get the list of each songs
  songs = await getSongs();
  playSong(songs[0], true);
  // console.log(songs);

  let song_Ul = document
    .querySelector(".song_list")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    song_Ul.innerHTML =
      song_Ul.innerHTML +
      `<li class="song_info flex align Cur_p">
                <img src="Music.svg" alt="">
                <div class="song_info_details">
                  <div> ${song
                    .replaceAll("%20", " ")}</div>
                  <div>Jitesh Jha</div>
                </div>
                <img class="lib-btn play_btn_img" src="/Assets/PlayCircle.svg" alt="">
              </li>`;
  }

  //attach an event listner to each song
  Array.from(
    document.querySelector(".song_list").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector("div").firstElementChild.innerHTML)
      playSong(e.querySelector("div").firstElementChild.innerHTML.trim());
    });
  });

  //attach an event listner to play,next and previous

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "Pause.svg";
    } else {
      currentSong.pause();
      play.src = "PlayCircle.svg";
    }
  });

  //listen for time Updation

  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".song_time").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime.toFixed(0)
    )} / ${secondsToMinutesSeconds(currentSong.duration.toFixed(0))}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
  });

  //Add an event listner to seekbar

  document.querySelector(".seek_time").addEventListener("click", (e)=>{
    let Percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
    document.querySelector(".circle").style.left = (Percent + "%");
    currentSong.currentTime = (Percent*currentSong.duration)/100
  })

  //Hamburger and Close Functionality

  document.querySelector(".menu").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "0%"
  })

  document.querySelector(".close").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "-100%"
  })

  //Add event listners to Next and Previous

  document.querySelector(".prev").addEventListener("click", ()=>{
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    // console.log(index);
    if((index - 1) >= 0){
      playSong(songs[index - 1])
    }
  })

  document.querySelector(".next").addEventListener("click", ()=>{
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    // console.log(index);
    if((index + 1) < songs.length){
      playSong(songs[index + 1])
    }
  })

  //Volume button

  // document.querySelector(".vol_btn").addEventListener("mouseover", ()=>{
  //   document.querySelector(".vol_range").style.display = "inline-block"
  // })

  //Tried this but didn't worked :(

  //Add event listner to volume

  document.querySelector(".vol_range").addEventListener("change", (e)=>{
    // console.log(e,e.target,e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100
  })

}

main();