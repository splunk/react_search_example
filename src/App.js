import './App.css';
import { createSearchJob, getData } from '@splunk/splunk-utils/search';

import { useState, useEffect } from 'react'

import SingleValue from '@splunk/visualizations/SingleValue';
import Column from '@splunk/visualizations/Column';

import Link from '@splunk/react-ui/Link'
import List from '@splunk/react-ui/List'
import P from '@splunk/react-ui/Paragraph';
import Button from '@splunk/react-ui/Button';
import Text from '@splunk/react-ui/Text';

import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Heading from '@splunk/react-ui/Heading';
import { presets, formInputTypes } from './constants';
import SearchBar from '@splunk/react-search/components/Bar';
import Input from '@splunk/react-search/components/Input';

async function GetSessionKey(username, password, server) {
  var key = await fetch('https://'+server+':8089/services/auth/login', {
    method: 'POST',
    body: new URLSearchParams({
      'username': username,
      'password': password,
      'output_mode': 'json'
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(response => response.json())
    .then(data => {
      return data['sessionKey']
    })

  return { 'sessionKey': key }

}

function App() {


  const [sessionKey, setSessionKey] = useState("<Token>")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [serverURL, setServerURL] = useState("localhost")


  /* Second Visualization Variables */
  //Sid for Column Chart
  const [columnSid, setColumnSid] = useState()
  //Search for Column Chart
  const [splunkSearchColumn, setSplunkSearchColumn] = useState("search index=_* | stats count by sourcetype | eval count=random()%200 | fields sourcetype count")
  const [splunkSearchColumnEarliest, setSplunkSearchColumnEarliest] = useState('-24h')
  const [splunkSearchColumnLatest, setSplunkSearchColumnLatest] = useState('now')

  const [columnSearching, setColumnSearching] = useState(false)

  //Fields for Column Chart
  const [columnSearchResultsFields, setColumnSearchResultsFields] = useState()
  //Columns for Column Chart
  const [columnSearchResultsColumns, setColumnSearchResultsColumns] = useState()
  //Seconds to Complete for Column Chart
  const [columnSecondsToComplete, setColumnSecondsToComplete] = useState()
  const [columnSearchOptions, setColumnSearchOptions] = useState({
    earliest: splunkSearchColumnEarliest,
    latest: splunkSearchColumnLatest,
    search: splunkSearchColumn,
    timePickerPresets: presets,
    timePickerFormInputTypes: formInputTypes,
    timePickerAdvancedInputTypes: [],
  })
  const [columnSearchObj, setColumnSearchObj] = useState({
    search: '',
    earliest: '',
    latest: ''
  })

  /* Second Visualization Post Process Variables */
  const [splunkSearchColumnPostProcess, setSplunkSearchColumnPostProcess] = useState("| search sourcetype=\"splunk*\" OR sourcetype=\"*scheduler*\" | sort 0 - count")
  const columnPostProcessBar = <Input
    value={splunkSearchColumnPostProcess}
    onChange={(e, value) => handlePostProcessChange(e, value, setSplunkSearchColumnPostProcess)}
    onEnter={() => handleEventTrigger(columnSid, splunkSearchColumnPostProcess, setColumnSearchResultsFields, setColumnSearchResultsColumns)}
  />

  //Sid for Single Value
  const [singleValueSid, setSingleValueSid] = useState()
  //Search for Single Value
  const [splunkSearchSingleValue, setSplunkSearchSingleValue] = useState("search index=_internal | stats count by sourcetype")
  const [splunkSearchSingleValueEarliest, setSplunkSearchSingleValueEarliest] = useState('-24h')
  const [splunkSearchSingleValueLatest, setSplunkSearchSingleValueLatest] = useState('now')

  const [singleValueSearching, setSingleValueSearching] = useState(false)

  //Fields for Single Value
  const [singleValueSearchResultsFields, setSingleValueSearchResultsFields] = useState()
  //Columns for Single Value
  const [singleValueSearchResultsColumns, setSingleValueSearchResultsColumns] = useState()
  //Seconds to Complete for Single Value
  const [singleValueSeondsToComplete, setSingleValueSecondsToComplete] = useState()

  const [singleValueSearchOptions, setSingleValueSearchOptions] = useState({
    earliest: splunkSearchSingleValueEarliest,
    latest: splunkSearchSingleValueLatest,
    search: splunkSearchSingleValue,
    timePickerPresets: presets,
    timePickerFormInputTypes: formInputTypes,
    timePickerAdvancedInputTypes: [],
  })
  const [singleValueSearchObj, setSingleValueSearchObj] = useState({
    search: '',
    earliest: '',
    latest: ''
  })

  const [splunkSearchSingleValuePostProcess, setSplunkSearchSingleValuePostProcess] = useState("| search sourcetype=\"splunkd\"")
  const singleValuePostProcessBar = <Input
    value={splunkSearchSingleValuePostProcess}
    onChange={(e, value) => handlePostProcessChange(e, value, setSplunkSearchSingleValuePostProcess)}
    onEnter={() => handleEventTrigger(singleValueSid, splunkSearchSingleValuePostProcess, setSingleValueSearchResultsFields, setSingleValueSearchResultsColumns)}
  />



  //Session Key for Authorization
  //URL for Authorization
  const splunkURL = "https://"+serverURL+":8089"
  //Headers for Authorization
  const headers = {
    headers: {
      Authorization: `Splunk ${sessionKey}`,
    }
  }

  //Timer for Search length
  const timer = ms => new Promise(res => setTimeout(res, ms))

  async function load(sidJob, completeFunc, fieldsFunc, columnsFunc, setSearchingBool) {
    var completeSeconds = 0

    for (var i = 0; i < 30; i++) {
      fetchData(sidJob, fieldsFunc, columnsFunc)
        .then(data => data)
        .then(sidJob => {
          if (sidJob) {
            completeSeconds = completeSeconds + 1
            setSearchingBool(false)
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


  //Function for Clicking the Post Process Search Button
  function handlePostProcessClick(locaPostProcessSid, postProcessSearch, setFields, setColumns) {
    postProcess(locaPostProcessSid, postProcessSearch, setFields, setColumns)
  }

  //Function for Updating the Post Process Search
  function handlePostProcessChange(e, value, setPostProcess) {
    setPostProcess(value.value)
  }

  const createJob = async (search, earliest, latest) => {
    const n = createSearchJob({
      search: search,
      earliest_time: earliest,
      latest_time: latest,
    }, {}, { splunkdPath: splunkURL, app: "search", owner: username }, headers)
      .then(response => response)
      .then(data => data.sid
      )
    return n
  };

  const fetchData = async (sidJob, fieldsFunc, columnsFunc) => {
    const n = await getData(sidJob, "results", { output_mode: "json_cols" }, { splunkdPath: splunkURL, app: "search", owner: username }, headers)
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
    const n = await getData(sidJob, "results", { output_mode: "json_cols", "search": postProcess }, { splunkdPath: splunkURL, app: "search", owner: username }, headers)
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

  const handleOptionsChange = async (option, setSearchOptions, searchOptions) => {
    setSearchOptions(
      {
        ...searchOptions,
        ...option
      })
  };

  /**
   * Invoked when the user hits enter or click on the search button
   */
  const handleEventTrigger = async (eventType, Sid, setSidFunc, setSearchObjFunction, searchObj, setSecondsToComplete, setSearchResultsFields, setSearchResultsColumns, setSearchingBool, setOptionsFunc, searchOptions) => {
    setSearchObjFunction({
      search: searchOptions.search,
      earliest: searchOptions.earliest,
      latest: searchOptions.latest
    })
    switch (eventType) {
      case 'submit':
        setSearchingBool(true)
        createJob(searchOptions.search, searchOptions.earliest, searchOptions.latest)
          .then(data => data)
          .then(sidJob => {
            setSidFunc(sidJob)
            load(sidJob, setSecondsToComplete, setSearchResultsFields, setSearchResultsColumns, setSearchingBool)
          })

        break;
      case 'escape':
        this.handleOptionsChange({ search: '' }, setOptionsFunc, searchOptions);
        break;
      default:
        break;
    }
  };

  const handleServerChange = (e, { value }) => {
    setServerURL(value)
  };

  const handleUsernameChange = (e, { value }) => {
    setUsername(value)
  };

  const handlePasswordChange = (e, { value }) => {
    setPassword(value)
  };

  function handleLoginButton() {

    GetSessionKey(username, password, serverURL)
      .then(response => response)
      .then(data => {
        setSessionKey(data['sessionKey'])
      })
  }

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
        {sessionKey == "<Token>" ? <>
          <Heading level={2}>Setup Instructions</Heading>
          <P>Note: You may need to complete a step for this app to work with your Splunk Environment. Details below:</P>
          <List>
            <List.Item>You'll need to configure CORS on your Splunk Environment. Instructions can be found <Link to="https://dev.splunk.com/enterprise/docs/developapps/visualizedata/usesplunkjsstack/communicatesplunkserver/">here</Link></List.Item>
          </List></> : <></>}

        {sessionKey == "<Token>" ?
          <>
            <Heading level={1}>Please login to Splunk</Heading>

            <form>

              <Heading level={2}>Splunk Server:</Heading>

              <Text

                type="server"
                value={serverURL}
                onChange={handleServerChange}
              />
              <Heading level={2}>Username:</Heading>

              <Text

                type="username"
                value={username}
                onChange={handleUsernameChange}
              />
              <Heading level={2}>Password:</Heading>

              <Text


                type="password"
                value={password}
                onChange={handlePasswordChange}
              />
              <br />
              <Button label="Login" appearance="primary" onClick={() => handleLoginButton()} />
            </form>

          </> :

          <div style={{ width: "100%" }}>
            <div style={{ float: "left", width: "47%", padding: "10px" }}>

              <Heading style={wordBreakStyle} level={3}>This is a Single Value that is populated by the following search: </Heading>
              <div style={{ padding: "10px" }}>

                <SearchBar
                  options={singleValueSearchOptions}
                  onOptionsChange={(options) => handleOptionsChange(options, setSingleValueSearchOptions, singleValueSearchOptions)}
                  onEventTrigger={(eventType) => handleEventTrigger(eventType, singleValueSid, setSingleValueSid, setSingleValueSearchObj, singleValueSearchObj, setSingleValueSecondsToComplete, setSingleValueSearchResultsFields, setSingleValueSearchResultsColumns, setSingleValueSearching, setSingleValueSearchOptions, singleValueSearchOptions)}
                />
              </div>
              {singleValueSearching ? <WaitSpinner size="medium" /> : <></>}

              {singleValueSeondsToComplete ? <>
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

                <Heading style={wordBreakStyle} level={3}>Clicking this button will execute the following post-process search: </Heading>

                {singleValuePostProcessBar}

                <Button label="Execute Post-process" appearance="primary" onClick={() => handlePostProcessClick(singleValueSid, splunkSearchSingleValuePostProcess, setSingleValueSearchResultsFields, setSingleValueSearchResultsColumns)} />
                <P style={wordBreakStyle}>
                  Search: {singleValueSearchOptions.search}
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
              </> : <></>}

            </div>

            <div style={{ float: "right", width: "47%", padding: "10px" }}>

              <Heading style={wordBreakStyle} level={3}>This is a Column Chart that is populated by the following search: </Heading>
              <div style={{ padding: "10px" }}>
                <SearchBar
                  options={columnSearchOptions}
                  onOptionsChange={(options) => handleOptionsChange(options, setColumnSearchOptions, columnSearchOptions)}
                  onEventTrigger={(eventType) => handleEventTrigger(eventType, columnSid, setColumnSid, setColumnSearchObj, columnSearchObj, setColumnSecondsToComplete, setColumnSearchResultsFields, setColumnSearchResultsColumns, setColumnSearching, setColumnSearchOptions, columnSearchOptions)}
                />
              </div>
              {columnSearching ? <WaitSpinner size="medium" /> : <></>}

              {columnSecondsToComplete ? <>
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

                <Heading style={wordBreakStyle} level={3}>Clicking this button will execute the following post-process search: </Heading>

                {columnPostProcessBar}

                <Button label="Execute Post-process" appearance="primary" onClick={() => handlePostProcessClick(columnSid, splunkSearchColumnPostProcess, setColumnSearchResultsFields, setColumnSearchResultsColumns)} />

                <P style={wordBreakStyle}>
                  Search: {columnSearchOptions.search}
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
              </> : <></>
              }
            </div>
          </div>
        }
      </header>
    </div>
  );
}

export default App;
