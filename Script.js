let currentSong = new Audio();
const play = document.querySelector(".play");
let songs;
let currFolder;
let Anchors;
let cardHTML = ""; // build string here

//Converts duration into correct format

function secondsToMinutesSeconds(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

//Disabling play buttons

function disablePlay() {
  isPlayable = false;
  play.classList.add("disabled");
  play.style.pointerEvents = "none";
  play.style.opacity = "0.4";
}

function enablePlay() {
  isPlayable = true;
  play.classList.remove("disabled");
  play.style.pointerEvents = "auto";
  play.style.opacity = "1";
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();

  // console.log(response);

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  // console.log(as);

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //Show all songs in the playlist

  let song_Ul = document
    .querySelector(".song_list")
    .getElementsByTagName("ul")[0];

  song_Ul.innerHTML = ""; //this helps in changing the folder and not adding the song in the same folder
  for (const song of songs) {
    song_Ul.innerHTML =
      song_Ul.innerHTML +
      `<li class="song_info flex align Cur_p">
                <img src="/Assets/Music.svg" alt="">
                <div class="song_info_details">
                  <div> ${song.replaceAll("%20", " ")}</div>
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
  return songs;
}

let defaultSongName = "Select a song to be played";

const playSong = (track, shouldPlay = true) => {
  // Always update UI
  document.querySelector(".song_details").innerText = track
    ? track.replaceAll("%20", " ")
    : defaultSongName;

  if (!track) {
    disablePlay();
    return;
  }

  // Build path safely
  let songPath = `/${currFolder}/${track}`;

  currentSong.src = songPath;
  currentSong.load();
  enablePlay();

  if (shouldPlay) {
    currentSong.play().catch(() => {});
    play.src = "/Assets/Pause.svg";
  } else {
    play.src = "/Assets/PlayCircle.svg";
  }
};

async function DisplayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/Songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let Anchors = div.getElementsByTagName("a");
  cardHTML = "";

  for (let e of Anchors) {
    if (e.href.includes("/Songs/")) {
      let folder = e.href.split("/Songs/")[1];
      console.log(folder);

      let a = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`);
      let response = await a.json();

      cardHTML += `
        <div data-folder="${folder}" class="card Cur_p">
          <div class="play_btn">
            <img class="play_btn_img playlists_btn" src="/Assets/PlayCircle.svg" />
          </div>
          <img class="song_img" src="/Songs/${folder}/COVER.jpeg" />
          <h3 class="song_title">${response.title}</h3>
          <p class="song_artists">${response.description}</p>
        </div>`;
    }
  }

  document.querySelector(".card_container").innerHTML = cardHTML;
}

async function main() {
  disablePlay();
  document.querySelector(".song_details").innerText = defaultSongName;
  //get the list of each songs
  await getSongs(`Songs`);

  if (songs.length > 0) {
    playSong(songs[0], false); // preload UI + metadata only
  }

  playSong(songs[0], true);
  // console.log(songs);

  //Display all the albums on the page

  await DisplayAlbums();

  //attach an event listner to play,next and previous

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/Assets/Pause.svg";
    } else {
      currentSong.pause();
      play.src = "/Assets/PlayCircle.svg";
    }
  });

  //listen for time Updation

  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".song_time").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime.toFixed(0)
    )} / ${secondsToMinutesSeconds(currentSong.duration.toFixed(0))}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Add an event listner to seekbar

  document.querySelector(".seek_time").addEventListener("click", (e) => {
    let Percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = Percent + "%";
    currentSong.currentTime = (Percent * currentSong.duration) / 100;
  });

  //Hamburger and Close Functionality

  document.querySelector(".menu").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  //Add event listners to Next and Previous

  document.querySelector(".prev").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    // console.log(index);
    if (index - 1 >= 0) {
      playSong(songs[index - 1]);
    }
  });

  document.querySelector(".next").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    // console.log(index);
    if (index + 1 < songs.length) {
      playSong(songs[index + 1]);
    }
  });

  //Volume button

  // document.querySelector(".vol_btn").addEventListener("mouseover", ()=>{
  //   document.querySelector(".vol_range").style.display = "inline-block"
  // })

  //Tried this but didn't worked :(

  //Add event listner to volume

  let volRange = document.querySelector(".vol_range")
    volRange.addEventListener("change", (e) => {
      // console.log(e,e.target,e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //Load the playlist whenever the card is clicked

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    // console.log(e, e.target, e.target.id);
    e.addEventListener("click", async (item) => {
      console.log(item, item.currentTarget.dataset);
      songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
    });
  });

  //Volume button Muting functionality
  document.querySelector(".vol_btn").addEventListener("click", (e) => {
    // console.log(e.target);
    if (e.target.src.includes("Volume")) {
      e.target.src = e.target.src.replaceAll("Volume", "Mute")
      currentSong.volume = 0
      volRange.value = 0
    } else {
      e.target.src = e.target.src.replaceAll("Mute", "Volume")
      currentSong.volume = 0.1
      volRange.value = 10
    }
  });
}
main();
