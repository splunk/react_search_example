import './App.css';
import { createSearchJob, getData } from '@splunk/splunk-utils/search';
import { useState, useEffect } from 'react'

import SingleValue from '@splunk/visualizations/SingleValue';
import Column from '@splunk/visualizations/Column';

import Link from '@splunk/react-ui/Link'
import List from '@splunk/react-ui/List'
import P from '@splunk/react-ui/Paragraph';
import Button from '@splunk/react-ui/Button';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Heading from '@splunk/react-ui/Heading';

function App() {


  //Sid for Column Chart
  const [columnSid, setColumnSid] = useState()
  //Search for Column Chart
  const splunkSearchColumn = "search index=_* | stats count by sourcetype | eval count=random()%200 | fields sourcetype count"
  const splunkSearchColumnPostProcess = "| search sourcetype=\"splunk*\" OR sourcetype=\"*scheduler*\" | sort 0 - count"
  //Fields for Column Chart
  const [columnSearchResultsFields, setColumnSearchResultsFields] = useState()
  //Columns for Column Chart
  const [columnSearchResultsColumns, setColumnSearchResultsColumns] = useState()
  //Seconds to Complete for Column Chart
  const [columnSecondsToComplete, setColumnSecondsToComplete] = useState()


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
  const sessionKey = "<Token>"
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

    if (!columnSid) {
      createJob(splunkSearchColumn)
        .then(data => data)
        .then(sidJob => {
          setColumnSid(sidJob)
          load(sidJob, setColumnSecondsToComplete, setColumnSearchResultsFields, setColumnSearchResultsColumns)
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

  const wordBreakStyle = { overflowWrap: "break-word", margin: "10px" }
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

              <Heading style={wordBreakStyle} level={4}>This is a Single Value that is populated by the following search: </Heading>
              <Heading style={wordBreakStyle} level={5}>&nbsp;&nbsp;&nbsp;&nbsp;{splunkSearchSingleValue}</Heading>

              {singleValueSeondsToComplete ? <>
                <Heading style={wordBreakStyle} level={4}>Clicking this button will execute the following post-process search: </Heading>
                <Heading style={wordBreakStyle} level={5}>&nbsp;&nbsp;&nbsp;&nbsp;{splunkSingleValuePostProcess}</Heading>

                <Button label="Execute Post-process" appearance="primary" onClick={() => handlePostProcessClick(singleValueSid, splunkSingleValuePostProcess, setSingleValueSearchResultsFields, setSingleValueSearchResultsColumns)} />
                <P style={wordBreakStyle}>
                  Search: {splunkSearchSingleValue}
                </P>
                <P style={wordBreakStyle}>

                  {"Splunk SID: " + singleValueSid}
                </P>
                <P style={wordBreakStyle}>
                  {"Seconds to Complete: " + JSON.stringify(singleValueSeondsToComplete)}
                </P>
                <P style={wordBreakStyle}>
                  {"Splunk Results - Fields: " + JSON.stringify(singleValueSearchResultsFields)}
                </P>
                <P style={wordBreakStyle}>
                  {"Splunk Results - Columns: " + JSON.stringify(singleValueSearchResultsColumns)}
                </P>
              </> : <WaitSpinner size="medium" />}

            </div>

            <div style={{float: "right", width: "50%"}}>
              <Column
                options={{}}
                dataSources={{
                  primary: {

                    data: {
                      fields: columnSearchResultsFields,
                      columns: columnSearchResultsColumns,
                    },
                    meta: {},
                  },
                }}
              />
              <Heading style={wordBreakStyle} level={4}>This is a Column Chart that is populated by the following search: </Heading>
              <Heading style={wordBreakStyle} level={5}>&nbsp;&nbsp;&nbsp;&nbsp;{splunkSearchColumn}</Heading>

              {columnSecondsToComplete ? <>
                <Heading style={wordBreakStyle} level={4}>Clicking this button will execute the following post-process search: </Heading>
                <Heading style={wordBreakStyle} level={5}>&nbsp;&nbsp;&nbsp;&nbsp;{splunkSearchColumnPostProcess}</Heading>

                <Button label="Execute Post-process" appearance="primary" onClick={() => handlePostProcessClick(columnSid, splunkSearchColumnPostProcess, setColumnSearchResultsFields, setColumnSearchResultsColumns)} />

                <P style={wordBreakStyle}>
                  Search: {splunkSearchColumn}
                </P>
                <P>

                  {"Splunk SID: " + columnSid}
                </P>
                <P style={wordBreakStyle}>
                  {"Seconds to Complete: " + JSON.stringify(columnSecondsToComplete)}
                </P>
                <P style={wordBreakStyle}>
                  {"Splunk Results - Fields: " + JSON.stringify(columnSearchResultsFields)}
                </P>
                <P style={wordBreakStyle}>
                  {"Splunk Results - Columns: " + JSON.stringify(columnSearchResultsColumns)}
                </P>
              </> : <WaitSpinner size="medium" />
              }
            </div>
          </div>
        }
      </header>
    </div>
  );
}

export default App;
