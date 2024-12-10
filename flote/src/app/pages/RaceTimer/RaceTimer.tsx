import React from 'react';
import { useState, useEffect } from 'react';
import { useCounter, useTimer } from 'react-timing-hooks';
import {Race} from "@models/Race.tsx";
import {Boat} from "@models/Boat.tsx";
import {TimeLinker} from "./TimeLinker.tsx"
import Background from "@atoms/Background";
import { Button } from "@nextui-org/react";
import Logo from "@atoms/Logo";
import PageTitle from "@atoms/PageTitle";
import SearchBar from "@atoms/SearchBar";
import HeaderProfile from "@atoms/HeaderProfile";
import {renderTime, getCounterStr, addTime, linkTime, unLinkTime, deleteTime} from "./timeListUtils.tsx";
import {TimerControls} from "./TimerControls.tsx";
import {AlreadyRecordedWarning} from "./AlreadyRecordedWarning.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useLocation} from "react-router-dom";
import { getBoatIDs, hasStartTime } from "./DBUtils.tsx";
//no, I will not organize my imports

export const UNLAPPED_CODE = -1; 
export const DNF_CODE = -2;
export const DNS_CODE = -3;

export default function RaceTimer(){
    const [counter, { start, isStopped, pause, resume, reset }] = useTimer(0);
    const [times, setTimes] = useState([]);
    const [linkingIndex, setLinkingIndex] = useState(-1);
    const [raceOver, setRaceOver] = useState(false);
    const {raceId} = useParams();
    const [boatIds, setBoatIds] = useState(["boat ID 1", "abcdefg", "foo", "Red October"]); 
    const [boatDBIds, setBoatDBIds] = useState([]);
    const [alreadyRec, setAlreadyRec] = useState(false);
    const location = useLocation();
    useEffect(() => {
       getBoatIDs(raceId, setBoatIds, setBoatDBIds); 
    },[raceId, boatIds, boatDBIds] ); 

    useEffect(() => {
       hasStartTime(raceId, setAlreadyRec);
    }, []); 

    const { user } = useAuth0();
       

    return <div className="bg-cover bg-center w-screen h-screen flex bg-white/90">
    <div className="my-5 mx-[15%] flex flex-col grow">
        <div className="timerHeader flex-initial">
            <HeaderProfile/>
            <div className="m-5"></div>
            <PageTitle title={getCounterStr(counter)} subtitle={"race timer: "} />
            <h1 className="text-2xl">Race Name: {}</h1>
        </div>

        <div className="grow overflow-y-scroll my-5 justify-between p-10 bg-slate-100">
            <h1 className="text-3xl">Finished Boats:</h1>
            <ul> {times.map((time, index) => renderTime(counter, time, index, setTimes, linkingIndex, setLinkingIndex, boatIds, boatDBIds))}</ul>
            
        </div>
        <div className="raceControls justify-self-end">
            <TimerControls setTimes = {setTimes} counter = {counter} start = {start} isStopped = {isStopped} pause = {pause} resume = {resume}  reset = {reset} boatIds ={boatIds} boatDBIds = {boatDBIds} raceOver = {raceOver} setRaceOver = {setRaceOver} raceId = {raceId}/>
        </div>
    </div>

    <TimeLinker boatIds = {boatIds} times = {times} setTimes = {setTimes} linkingIndex = {linkingIndex} setLinkingIndex = {setLinkingIndex} boatDBIds = {boatDBIds}/>
    <AlreadyRecordedWarning alreadyRec = {alreadyRec} setAlreadyRec = {setAlreadyRec}/>
  </div>

}
   
