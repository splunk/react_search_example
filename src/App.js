import './App.css';
import { createSearchJob, getData } from '@splunk/splunk-utils/search';
import { useState, useEffect } from 'react'
import SingleValue from '@splunk/visualizations/SingleValue';
import Line from '@splunk/visualizations/Line';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';

import Link from '@splunk/react-ui/Link'
import List from '@splunk/react-ui/List'
import P from '@splunk/react-ui/Paragraph';
import Heading from '@splunk/react-ui/Heading';
import { useSplunkTheme } from '@splunk/themes';

function App() {


  const [lineSid, setLineSid] = useState()


  const splunkSearchLine = "search index=_internal | timechart span=10s count"

  const [lineSearchResultsFields, setLineSearchResultsFields] = useState()
  const [lineSearchResultsColumns, setLineSearchResultsColumns] = useState()
  const [lineSecondsToComplete, setLineSecondsToComplete] = useState()


  const [singleValueSid, setSingleValueSid] = useState()
  const splunkSearchSingleValue = "search index=_internal | stats count"
  const [singleValueSearchResultsFields, setSingleValueSearchResultsFields] = useState()
  const [singleValueSearchResultsColumns, setSingleValueSearchResultsColumns] = useState()
  const [singleValueSeondsToComplete, setSingleValueSecondsToComplete] = useState()


  const sessionKey = "eyJraWQiOiJzcGx1bmsuc2VjcmV0IiwiYWxnIjoiSFM1MTIiLCJ2ZXIiOiJ2MiIsInR0eXAiOiJzdGF0aWMifQ.eyJpc3MiOiJhZG1pbiBmcm9tIEMwMldSMUg0SFRERCIsInN1YiI6ImFkbWluIiwiYXVkIjoiVGVzdGluZyIsImlkcCI6IlNwbHVuayIsImp0aSI6IjY4ZTcwYjA5MDljYTA3ZmI2ZDAwZTVkMTE4MTNkZDIwMDk3ZTY0ZjhlYjU2ZGFjZjJlNzcyZGFlMDlhNzc3NmIiLCJpYXQiOjE2NDAyMDc3NzgsImV4cCI6MTY0Mjc5OTc3OCwibmJyIjoxNjQwMjA3Nzc4fQ.Ru3FNEbPE_c1OSmM3NBzHHSdlu2FsXhvRppqsfLX8GsNpViPtsoGd53CUcNb_thIVcgPN29lMkAz_BhaxXRQCg"
  const splunkURL = "https://localhost:8089"


  const headers = {
    headers: {
      Authorization: `Splunk ${sessionKey}`,
    }
  }

  const timer = ms => new Promise(res => setTimeout(res, ms))

  useEffect(() => {

    if (!singleValueSid) {
      createJob(splunkSearchSingleValue)
        .then(data => data)
        .then(sidJob => {
          setSingleValueSid(sidJob)
          load(sidJob, setSingleValueSecondsToComplete, setSingleValueSearchResultsFields, setSingleValueSearchResultsColumns)
        })
    }

    if (!lineSid) {
      createJob(splunkSearchLine)
        .then(data => data)
        .then(sidJob => {
          setLineSid(sidJob)
          load(sidJob, setLineSecondsToComplete, setLineSearchResultsFields, setLineSearchResultsColumns)
        })
    }
  }, [])

  async function load(sidJob, completeFunc, fieldsFunc, columnsFunc) {
    var completeSeconds = 0

    for (var i = 0; i < 7; i++) {
      fetchData(sidJob, fieldsFunc, columnsFunc)
        .then(data => data)
        .then(sidJob => {
          if (sidJob) {
            completeSeconds = completeSeconds + 1
            completeFunc(completeSeconds)
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

  const createJob = async (search) => {
    const n = createSearchJob({
      search: search,
      earliest_time: '-60m@m',
      latest_time: 'now',
    }, {}, { splunkdPath: splunkURL, app: "search", owner: "admin" }, headers)
      .then(response => response)
      .then(data => data.sid
      )
    return n
  };

  const fetchData = async (sidJob, fieldsFunc, columnsFunc) => {
    const n = await getData(sidJob, "results", { output_mode: "json_cols" }, { splunkdPath: splunkURL, app: "search", owner: "admin" }, headers)
      .then(response => response)
      .then(data => {
        if (data) {
          fieldsFunc(data.fields)
          columnsFunc(data.columns)
          return data
        }
      })
    return n
  };

  return (
    <div className="App">
      <header className="App-header">
        <Heading level={1}>@splunk/splunk-utils Example app</Heading>
        <P>This app will show you how to query Splunk from a remote webapp using our Splunk UI Toolkit in React. It uses a couple of packages listed below: </P>
        <List>
          <List.Item><Link to="https://www.npmjs.com/package/@splunk/splunk-utils">@splunk/splunk-utils</Link></List.Item>
          <ul><li><Link to="https://splunkui.splunkeng.com/Packages/splunk-utils">Documentation</Link></li></ul>
          <List.Item><Link to="https://www.npmjs.com/package/@splunk/visualizations">@splunk/visualizations</Link></List.Item>
          <ul><li><Link to="https://splunkui.splunkeng.com/Packages/visualizations">Documentation</Link></li></ul>
          <List.Item><Link to="https://www.npmjs.com/package/@splunk/react-ui">@splunk/react-ui</Link></List.Item>
          <ul><li><Link to="https://splunkui.splunkeng.com/Packages/react-ui">Documentation</Link></li></ul>
        </List>

        <Heading level={2}>Setup Instructions</Heading>
        <P>You'll need to take complete a couple of setup steps for this app to work with your Splunk Environment.</P>
        <List>
          <List.Item>Setup your own Authentication Token to use this app. Instructions can be found <Link to="https://docs.splunk.com/Documentation/Splunk/8.2.3/Security/CreateAuthTokens">here</Link></List.Item>
          <List.Item>You'll need to configure CORS. Instructions can be found <Link to="https://dev.splunk.com/enterprise/docs/developapps/visualizedata/usesplunkjsstack/communicatesplunkserver/">here</Link></List.Item>
        </List>


<div style={{width:"100%"}}>
  <div style={{float:"left"}}>
              <SingleValue
                options={{
                  majorColor: '#008000',
                }}
                dataSources={{
                  primary: {
                    data: {
                      columns: singleValueSearchResultsColumns,
                      fields: singleValueSearchResultsFields
                    },
                    meta: {},
                  },
                }}
              />

              <Heading level={2}>This is a Single Value that represents the following search: </Heading>
              <P>Search: {splunkSearchSingleValue}</P>
              <P>

                {"Splunk SID: " + singleValueSid}
              </P>
              <P>
                {"Seconds to Complete: " + JSON.stringify(singleValueSeondsToComplete)}
              </P>
              <P>
                {"Splunk Results - Fields: " + JSON.stringify(singleValueSearchResultsFields)}
              </P>
              <P>
                {"Splunk Results - Columns: " + JSON.stringify(singleValueSearchResultsColumns)}
              </P>
      </div>
      <div style={{float:"right", width: "50%"
}}>

            
              <Line
        options={{}}
        dataSources={{
            primary: {
                
                data: {
                    fields: lineSearchResultsFields,
                    columns: lineSearchResultsColumns,
                },
                meta: {  },
            },
        }}
    />
              <Heading level={2}>This is a Line Chart that represents the following search: </Heading>

              <P>Search: {splunkSearchLine}</P>
              <P>

                {"Splunk SID: " + lineSid}
              </P>
              <P>
                {"Seconds to Complete: " + JSON.stringify(lineSecondsToComplete)}
              </P>
              <P>
                {"Splunk Results - Fields: " + JSON.stringify(lineSearchResultsFields)}
              </P>
              <P>
                {"Splunk Results - Columns: " + JSON.stringify(lineSearchResultsColumns)}
              </P>
    </div>
    </div>

      </header>
    </div>
  );
}

export default App;
