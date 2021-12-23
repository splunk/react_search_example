import logo from './logo.svg';
import './App.css';
import { createSearchJob, getData } from '@splunk/splunk-utils/search';
import { useState, useEffect } from 'react'
import SingleValue from '@splunk/visualizations/SingleValue';

function App() {

  const [sid, setSid] = useState()
  const [searchResultsFields, setSearchResultsFields] = useState()
  const [searchResultsColumns, setSearchResultsColumns] = useState()
  const [secondsToComplete, setSecondsToComplete] = useState()


  const sessionKey = "<Token>"
  const splunkURL = "https://localhost:8089"
  const splunkSearch = "search index=_internal | stats count"

  const headers = {
    headers: {
      Authorization: `Splunk ${sessionKey}`,
    }
  }

  const timer = ms => new Promise(res => setTimeout(res, ms))

  useEffect(() => {

    if (!sid) {
      createJob()
        .then(data => data)
        .then(sidJob => {
          setSid(sidJob)
          load(sidJob)
        })
    }
  }, [])

  async function load(sidJob) { 
    var completeSeconds = 0

    for (var i = 0; i < 7; i++) {
      fetchData(sidJob)
        .then(data => data)
        .then(sidJob => {
          if (sidJob) {
            completeSeconds = completeSeconds + 1
            setSecondsToComplete(completeSeconds)
          }
        })
      if (!completeSeconds) {
        await timer(1000);
      }
      else {
        break
      }
    }
  }

  const createJob = async () => {
    const n = createSearchJob({
      search: splunkSearch,
      earliest_time: '-60m@m',
      latest_time: 'now',
    }, {}, { splunkdPath: splunkURL, app: "search", owner: "admin" }, headers)
      .then(response => response)
      .then(data => data.sid
      )
    return n
  };

  const fetchData = async (sidJob) => {
    const n = await getData(sidJob, "results", { output_mode: "json_cols" }, { splunkdPath: splunkURL, app: "search", owner: "admin" }, headers)
      .then(response => response)
      .then(data => {
        if (data) {
          setSearchResultsFields(data.fields)
          setSearchResultsColumns(data.columns)
          return data
        }
      })
    return n
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>@splunk/splunk-utils Example app. This app uses couple of packages available on https://splunkui.splunk.com (@splunk/splunk-utils, @splunk/visualizations)</p>
          <p>Be mindful that you'll need to setup your own Auth Token (https://docs.splunk.com/Documentation/Splunk/8.2.3/Security/CreateAuthTokens) to use this app.  </p>
        <h4>This is Single Value that represents the following search: </h4>
        <p>{splunkSearch}</p>
      <SingleValue
          options={{
            majorColor: '#008000',
          }}
          dataSources={{
            primary: {
              data: {
                columns: searchResultsColumns,
                fields: searchResultsFields
              },
              meta: {},
            },
          }}
        />        
        <h3>Info about this search</h3><p>
          {"Splunk SID: " + sid}
        </p>
        <p>
          {"Seconds to Complete: " + JSON.stringify(secondsToComplete)}
        </p>
        <p>
          {"Splunk Results - Fields: " + JSON.stringify(searchResultsFields)}
        </p>
        <p>
          {"Splunk Results - Columns: " + JSON.stringify(searchResultsColumns)}
        </p>
      </header>
    </div>
  );
}

export default App;
