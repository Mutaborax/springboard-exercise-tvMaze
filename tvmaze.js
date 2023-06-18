const MISSING_IMAGE_URL = "http://tinyurl.com/missing-tv";

// Given a query string, return array of matching shows
async function searchShows(query) {
  const response = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);

  const shows = response.data.map(({show}) => ({
    id: show.id,
    name: show.name,
    summary: show.summary,
    image: show.image ? show.image.medium : MISSING_IMAGE_URL,
  }));

  return shows;
}

// Populate shows list - given list of shows, add shows to DOM
function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (const show of shows) {
    const $item = $(`
      <div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
        <div class="card" data-show-id="${show.id}">
          <img class="card-img-top" src="${show.image}">
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">${show.summary}</p>
            <button class="btn btn-primary get-episodes">Episodes</button>
          </div>
        </div>  
      </div>
    `);

    $showsList.append($item);
  }
}

// Handle search form submission - hide episodes area, get matching shows and show in shows list
$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();

  const query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  const shows = await searchShows(query);

  populateShows(shows);
});

// Given a show ID, return list of episodes
async function getEpisodes(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  const episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));

  return episodes;
}

// Populate episodes list - given list of episodes, add episodes to DOM
function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();

  for (const episode of episodes) {
    const $item = $(`
      <li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
      </li>
    `);

    $episodesList.append($item);
  }

  $("#episodes-area").show();
}

// Handle click on show name
$("#shows-list").on("click", ".get-episodes", async function handleEpisodeClick(evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodes(showId);
  populateEpisodes(episodes);
});