import './App.css';
import { createSearchJob, getData } from '@splunk/splunk-utils/search';
import { useState, useEffect } from 'react'

import SingleValue from '@splunk/visualizations/SingleValue';
import Line, { lineOptionValuesSCMapping } from '@splunk/visualizations/Line';

import Link from '@splunk/react-ui/Link'
import List from '@splunk/react-ui/List'
import P from '@splunk/react-ui/Paragraph';
import Button from '@splunk/react-ui/Button';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Heading from '@splunk/react-ui/Heading';

function App() {


  //Sid for Line Chart
  const [lineSid, setLineSid] = useState()
  //Search for Line Chart
  const splunkSearchLine = "search index=_internal | timechart span=1m count by sourcetype | eval count=random()%200 | fields _time splunkd splunkd_access splunkd_ui_access count"
  const splunkSearchLinePostProcess = "| fields splunkd count"
  //Fields for Line Chart
  const [lineSearchResultsFields, setLineSearchResultsFields] = useState()
  //Columns for Line Chart
  const [lineSearchResultsColumns, setLineSearchResultsColumns] = useState()
  //Seconds to Complete for Line Chart
  const [lineSecondsToComplete, setLineSecondsToComplete] = useState()


  //Sid for Single Value
  const [singleValueSid, setSingleValueSid] = useState()
  //Search for Single Value
  const splunkSearchSingleValue = "search index=_internal | stats count by sourcetype"
  const splunkSingleValuePostProcess = "| search sourcetype=\"splunkd\""
  //Fields for Single Value
  const [singleValueSearchResultsFields, setSingleValueSearchResultsFields] = useState()
  //Columns for Single Value
  const [singleValueSearchResultsColumns, setSingleValueSearchResultsColumns] = useState()
  //Seconds to Complete for Single Value
  const [singleValueSeondsToComplete, setSingleValueSecondsToComplete] = useState()

  //Session Key for Authorization
  const sessionKey = "eyJraWQiOiJzcGx1bmsuc2VjcmV0IiwiYWxnIjoiSFM1MTIiLCJ2ZXIiOiJ2MiIsInR0eXAiOiJzdGF0aWMifQ.eyJpc3MiOiJhZG1pbiBmcm9tIEMwMldSMUg0SFRERCIsInN1YiI6ImFkbWluIiwiYXVkIjoiRXZlcnlvbmUiLCJpZHAiOiJTcGx1bmsiLCJqdGkiOiIzMzQxMzJkODlkMWNlYTRhNTNlMmZjZWIwYTllYzc1NWUxMjE5NDE3NDYyZDU2ZjRmOTQyZTE3OTk0M2RiYzQ5IiwiaWF0IjoxNjQ0NTg5MjQwLCJleHAiOjE2NjAxNDEyNDAsIm5iciI6MTY0NDU4OTI0MH0.odec6xzQ-mupNsSU-A0XDOMekpmsDxNGHuV15HUpy2frrJx2eKOU6dYSwysOTpQX700cPUgrPnLBf_9eOI9HqA"
  //const sessionKey = "<Token>"
  //URL for Authorization
  const splunkURL = "https://localhost:8089"
  //Headers for Authorization
  const headers = {
    headers: {
      Authorization: `Splunk ${sessionKey}`,
    }
  }



  //Timer for Search length
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

    for (var i = 0; i < 30; i++) {
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

  function handlePostProcessClick(locaPostProcessSid, postProcessSearch, setFields, setColumns) {
    postProcess(locaPostProcessSid, postProcessSearch, setFields, setColumns)
  }

  const createJob = async (search) => {
    const n = createSearchJob({
      search: search,
      earliest_time: '-24h',
      latest_time: '-1h',
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

  const postProcess = async (sidJob, postProcess, fieldsFunc, columnsFunc) => {
    const n = await getData(sidJob, "results", { output_mode: "json_cols", "search": postProcess }, { splunkdPath: splunkURL, app: "search", owner: "admin" }, headers)
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
        <P>You'll need to complete a couple of setup steps for this app to work with your Splunk Environment.</P>
        <List>
          <List.Item>Setup your own Authentication Token to use inside of this app. Replace that token you create with the sessionKey inside of this file. Instructions can be found <Link to="https://docs.splunk.com/Documentation/Splunk/8.2.3/Security/CreateAuthTokens">here</Link></List.Item>
          <List.Item>You'll need to configure CORS on your Splunk Environment. Instructions can be found <Link to="https://dev.splunk.com/enterprise/docs/developapps/visualizedata/usesplunkjsstack/communicatesplunkserver/">here</Link></List.Item>
        </List>


        {sessionKey == "<Token>" ? <Heading level={1}>Please set your authorization token</Heading> :

          <div style={{ width: "100%" }}>
            <div style={{ float: "left", width: "50%" }}>
              <SingleValue
                options={{
                  majorColor: '#008000',
                  sparklineDisplay: "off",
                  trendDisplay: "off"
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

              <Heading style={{overflowWrap:"break-word", margin: "10px"}} level={2}>This is a Single Value that represents the following search: </Heading>

              {singleValueSeondsToComplete ? <>
                <Heading style={{overflowWrap:"break-word", margin: "10px"}} level={3}>Clicking this button will execute a post-process search: </Heading>

                <Button label="Execute Post-process" appearance="primary" onClick={() => handlePostProcessClick(singleValueSid, splunkSingleValuePostProcess, setSingleValueSearchResultsFields, setSingleValueSearchResultsColumns)} />
              <P style={{overflowWrap:"break-word", margin: "10px"}}>
                Search: {splunkSearchSingleValue}
                </P>
                <P style={{overflowWrap:"break-word", margin: "10px"}}>

                {"Splunk SID: " + singleValueSid}
              </P>
              <P style={{overflowWrap:"break-word", margin: "10px"}}>
                {"Seconds to Complete: " + JSON.stringify(singleValueSeondsToComplete)}
              </P>
              <P style={{overflowWrap:"break-word", margin: "10px"}}>
                {"Splunk Results - Fields: " + JSON.stringify(singleValueSearchResultsFields)}
              </P>
              <P style={{overflowWrap:"break-word", margin: "10px"}}>
                {"Splunk Results - Columns: " + JSON.stringify(singleValueSearchResultsColumns)}
              </P>
              </> :  <WaitSpinner size="medium" />}

            </div>

            <div style={{
              float: "right", width: "50%"
            }}>


              <Line
                options={{}}
                dataSources={{
                  primary: {

                    data: {
                      fields: lineSearchResultsFields,
                      columns: lineSearchResultsColumns,
                    },
                    meta: {},
                  },
                }}
              />
              <Heading style={{overflowWrap:"break-word", margin: "10px"}} level={2}>This is a Line Chart that represents the following search: </Heading>

              {lineSecondsToComplete ? <>
                <Heading style={{overflowWrap:"break-word", margin: "10px"}} level={3}>Clicking this button will execute a post-process search: </Heading>

                <Button label="Execute Post-process" appearance="primary" onClick={() => handlePostProcessClick(lineSid, splunkSearchLinePostProcess, setLineSearchResultsFields, setLineSearchResultsColumns)} />
             
              <P style={{overflowWrap:"break-word", margin: "10px"}}>
                Search: {splunkSearchLine}
                </P>
              <P>

                {"Splunk SID: " + lineSid}
              </P>
              <P style={{overflowWrap:"break-word", margin: "10px"}}>
                {"Seconds to Complete: " + JSON.stringify(lineSecondsToComplete)}
              </P>
              <P style={{overflowWrap:"break-word", margin: "10px"}}>
                {"Splunk Results - Fields: " + JSON.stringify(lineSearchResultsFields)}
              </P>
              <P style={{overflowWrap:"break-word", margin: "10px"}}>
                {"Splunk Results - Columns: " + JSON.stringify(lineSearchResultsColumns)}
              </P>
              </> :             <WaitSpinner size="medium" />
}
            </div>
          </div>
        }

      </header>
    </div>
  );
}

export default App;
