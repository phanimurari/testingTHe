import {setupServer} from 'msw/node'
import {rest} from 'msw'
import {createMemoryHistory} from 'history'
import {Router} from 'react-router-dom'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from '../App'

const teamsListResponse = {
  teams: [
    {
      name: 'Royal Challengers Bangalore',
      id: 'RCB',
      team_image_url:
        'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bangalore_2020.svg/1200px-Royal_Challengers_Bangalore_2020.svg.png',
    },
    {
      name: 'Kolkata Knight Riders',
      id: 'KKR',
      team_image_url:
        'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png',
    },
    {
      name: 'Kings XI Punjab',
      id: 'KXP',
      team_image_url:
        'https://i2.wp.com/orissadiary.com/wp-content/uploads/2021/02/oie_17102022UPRrIyFT.jpg?fit=500%2C500&ssl=1',
    },
    {
      name: 'Chennai Super Kings',
      id: 'CSK',
      team_image_url:
        'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png',
    },
    {
      name: 'Rajasthan Royals',
      id: 'RR',
      team_image_url:
        'https://www.rajasthanroyals.com/assets/images/RR_blue%20(1).png',
    },
    {
      name: 'Mumbai Indians',
      id: 'MI',
      team_image_url:
        'https://i.pinimg.com/originals/28/09/a8/2809a841bb08827603ccac5c6aee8b33.png',
    },
    {
      name: 'Sunrisers Hyderabad',
      id: 'SH',
      team_image_url:
        'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad.svg/1200px-Sunrisers_Hyderabad.svg.png',
    },
    {
      name: 'Delhi Capitals',
      id: 'DC',
      team_image_url:
        'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/1200px-Delhi_Capitals_Logo.svg.png',
    },
  ],
}

const recentMatchesResponse = {
  team_banner_url: 'https://assets.ccbp.in/frontend/react-js/kkr-team-img.png',
  latest_match_details: {
    umpires: 'CB Gaffaney, VK Sharma',
    result: 'Kolkata Knight Riders Won by 7 wickets',
    man_of_the_match: 'Shubman Gill',
    id: '1216545',
    date: '2020-09-26',
    venue: 'At Sheikh Zayed Stadium, Abu Dhabi',
    competing_team: 'Sunrisers Hyderabad',
    competing_team_logo:
      'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad.svg/1200px-Sunrisers_Hyderabad.svg.png',
    first_innings: 'Sunrisers Hyderabad',
    second_innings: 'Kolkata Knight Riders',
    match_status: 'Won',
  },
  recent_matches: [
    {
      umpires: 'RK Illingworth, K Srinivasan',
      result: 'Royal Challengers Bangalore Won by 82 runs',
      man_of_the_match: 'AB de Villiers',
      id: '1216540',
      date: '2020-10-12',
      venue: 'At Sharjah Cricket Stadium, Sharjah',
      competing_team: 'Royal Challengers Bangalore',
      competing_team_logo:
        'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bangalore_2020.svg/1200px-Royal_Challengers_Bangalore_2020.svg.png',
      first_innings: 'Royal Challengers Bangalore',
      second_innings: 'Kolkata Knight Riders',
      match_status: 'Lost',
    },
    {
      umpires: 'C Shamshuddin, RK Illingworth',
      result: 'Chennai Super Kings Won by 6 wickets',
      man_of_the_match: 'RD Gaikwad',
      id: '1216536',
      date: '2020-10-29',
      venue: 'At Dubai International Cricket Stadium, Dubai',
      competing_team: 'Chennai Super Kings',
      competing_team_logo:
        'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png',
      first_innings: 'Kolkata Knight Riders',
      second_innings: 'Chennai Super Kings',
      match_status: 'Lost',
    },
    {
      umpires: 'Nitin Menon, PR Reiffel',
      result: 'Kolkata Knight Riders Won by 60 runs',
      man_of_the_match: 'PJ Cummins',
      id: '1216530',
      date: '2020-11-01',
      venue: 'At Dubai International Cricket Stadium, Dubai',
      competing_team: 'Rajasthan Royals',
      competing_team_logo:
        'https://www.rajasthanroyals.com/assets/images/RR_blue%20(1).png',
      first_innings: 'Kolkata Knight Riders',
      second_innings: 'Rajasthan Royals',
      match_status: 'Won',
    },
  ],
}

const apiUrlTeams = 'https://apis.ccbp.in/ipl'

const apiUrlRecentMatches = 'https://apis.ccbp.in/ipl/KKR'

const server = setupServer(
  rest.get(apiUrlRecentMatches, (req, res, ctx) =>
    res(ctx.json(recentMatchesResponse)),
  ),
  rest.get(apiUrlTeams, (req, res, ctx) => res(ctx.json(teamsListResponse))),
)

const rtlRender = (ui = <App />, path = '/') => {
  const history = createMemoryHistory()
  history.push(path)
  render(<Router history={history}>{ui}</Router>)
  return {
    history,
  }
}

describe('Team Match Route Test Cases', () => {
  beforeAll(() => {
    server.listen()
  })
  afterEach(() => {
    server.resetHandlers()
  })
  afterAll(() => {
    server.close()
  })

  it('Page should render the recent matches data as a list containing a unique key as a prop for each recent match in Recent Matches:::5:::', async () => {
    const originalError = console.error
    const errorMockFn = jest.fn()
    console.error = errorMockFn

    rtlRender(<App />, '/team-matches/KKR')
    await waitFor(() => {
      expect(
        screen.getByText(/CB Gaffaney, VK Sharma/i, {exact: false}),
      ).toBeInTheDocument()
    })

    expect(console.error).not.toBeCalledWith(
      expect.stringContaining('Each child in a list should have a unique '),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
    expect(console.error).not.toBeCalledWith(
      expect.stringContaining('Encountered two children with the same key'),
      expect.anything(),
      expect.anything(),
    )
    console.error = originalError
  })

  it('When the Team Matches Route is opened, it should initially contain an HTML container element with testid attribute value as loader:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    await waitForElementToBeRemoved(() => screen.queryByTestId('loader'))
  })

  it('When the Team Matches Route is opened, an HTTP GET request should be made to the URL to get Recent Matches based on the team selected:::5:::', async () => {
    const originalFetch = window.fetch
    const mockFetchFunction = jest.fn().mockImplementation(() => ({
      json: () => Promise.resolve(recentMatchesResponse),
    }))
    window.fetch = mockFetchFunction
    rtlRender(<App />, '/team-matches/KKR')

    expect(window.fetch).toBeCalledWith(apiUrlRecentMatches)
    await waitFor(() => {
      expect(
        screen.getByText(/CB Gaffaney, VK Sharma/i, {exact: false}),
      ).toBeInTheDocument()
    })
    window.fetch = originalFetch
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of an HTML image element with src attribute value as bannerImageURL received in the response:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')

    await waitFor(() => {
      expect(
        screen.getByText(/CB Gaffaney, VK Sharma/i, {exact: false}),
      ).toBeInTheDocument()
    })
    expect(screen.getAllByRole('img')[0].src).toBe(
      recentMatchesResponse.team_banner_url,
    )
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of an HTML element with text content as competingTeam in the latest match details:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      expect(
        screen.getAllByText(latest_match_details.competing_team).length,
      ).toBe(2)
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of an HTML element with text content as the date in the latest match details in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      expect(screen.getByText(latest_match_details.date)).toBeInTheDocument()
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of an HTML element with text content as the venue in the latest match details in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      expect(screen.getByText(latest_match_details.venue)).toBeInTheDocument()
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of an HTML element with text content as result in the latest match details in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      expect(screen.getByText(latest_match_details.result)).toBeInTheDocument()
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of HTML image element with src attribute value as competingTeamLogo in the latest match details received in the response:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      const imageElements = screen.getAllByRole('img')
      expect(imageElements[1].src).toBe(
        latest_match_details.competing_team_logo,
      )
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of an HTML element with text content as firstInnings in the latest match details in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      expect(
        screen.getAllByText(latest_match_details.first_innings).length,
      ).toBe(2)
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of an HTML element with text content as secondInnings in the latest match details in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      expect(
        screen.getByText(latest_match_details.second_innings),
      ).toBeInTheDocument()
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of an HTML element with text content as manOfTheMatch in the latest match details in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      expect(
        screen.getByText(latest_match_details.man_of_the_match),
      ).toBeInTheDocument()
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of an HTML element with text content as umpires in the latest match details in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      expect(screen.getByText(latest_match_details.umpires)).toBeInTheDocument()
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of HTML image elements with src attribute value as competingTeamLogo in recent matches received in the response:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {recent_matches} = recentMatchesResponse
    await waitFor(() => {
      const imageElements = screen.getAllByRole('img')
      expect(imageElements[2].src).toBe(recent_matches[0].competing_team_logo)
      expect(imageElements[3].src).toBe(recent_matches[1].competing_team_logo)
      expect(imageElements[4].src).toBe(recent_matches[2].competing_team_logo)
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of HTML elements with text content as competingTeamNames in recent matches in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {recent_matches} = recentMatchesResponse
    await waitFor(() => {
      expect(
        screen.getByText(recent_matches[0].competing_team),
      ).toBeInTheDocument()
      expect(
        screen.getByText(recent_matches[1].competing_team),
      ).toBeInTheDocument()
      expect(
        screen.getByText(recent_matches[1].competing_team),
      ).toBeInTheDocument()
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of HTML elements with text content as the result of recent matches in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {recent_matches} = recentMatchesResponse
    await waitFor(() => {
      expect(screen.getByText(recent_matches[0].result)).toBeInTheDocument()
      expect(screen.getByText(recent_matches[1].result)).toBeInTheDocument()
      expect(screen.getByText(recent_matches[1].result)).toBeInTheDocument()
    })
  })

  it('When the HTTP GET request made in Team Matches Route is successful, then the page should consist of HTML elements with text content as matchStatus in recent matches in the response received:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    await waitFor(() => {
      expect(screen.getAllByText(/Lost/i, {exact: false}).length).toBe(2)
      expect(screen.getAllByText(/Won/i, {exact: false}).length).toBe(5)
    })
  })

  it('When "/team-matches/:id" is entered in the browser tab then the page should be navigated to the Team Matches route:::5:::', async () => {
    rtlRender(<App />, '/team-matches/KKR')
    const {latest_match_details} = recentMatchesResponse
    await waitFor(() => {
      expect(screen.getByText(latest_match_details.umpires)).toBeInTheDocument()
    })
  })

  it('When the Team Matches route is opened and back is clicked in the browser then the home page URL should be present:::5:::', async () => {
    const {history} = rtlRender()
    await waitFor(() => {
      expect(screen.getByText('Kolkata Knight Riders')).toBeInTheDocument()
    })
    userEvent.click(screen.getByText(/Kolkata Knight Riders/i, {exact: false}))
    expect(history.location.pathname).toBe('/team-matches/KKR')
    history.back()
    expect(history.location.pathname).toBe('/')
  })
})
