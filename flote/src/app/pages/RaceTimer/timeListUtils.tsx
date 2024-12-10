import { Button } from "@nextui-org/react";
import {DNF_CODE, DNS_CODE, UNLAPPED_CODE} from "./RaceTimer.tsx";
import {clearAllBoats, updateBoatTime, markBoatDNF, markBoatDNS} from "./DBUtils.tsx";

export function renderTime(count, time, index, setTimes, linkingIndex, setLinkingIndex, boatIds, boatDBIds){
    return (
    <li key={index} className="flex flex-row items-center"> 
        <div>{renderCount(time, count, index, setTimes)}</div> 
        <div className="grow">{renderBoatInfo(time, index, setTimes, linkingIndex, setLinkingIndex, boatIds, boatDBIds)}</div>
        <Button
            color="danger"
            size="lg"
            radius="sm"
            onPress={() => deleteTime(index, setTimes, boatIds, boatDBIds) }
            className="self-end w-32 m-6"
            >Delete </Button>

    </li>)
}

//either renders a lap button or the time
export function renderCount(time, count, index, setTimes){
    if(time[0] == DNF_CODE){
        return <div className="m-6">DNF</div>
    }

    if(time[0] == DNS_CODE){
        return <div className="m-6">DNS</div>
    }
    
    if(time[0] != UNLAPPED_CODE){
        return <div className="m-6">{getCounterStr(time[0])}</div>
    }

    //if here then there is no time linked
    return<Button
                color="primary"
                size="lg"
                radius="sm"
                onPress={() => {
                    updateCountOfTime(index, count, setTimes);  
                    }}
                className="self-end w-32 m-6"
                >Lap</Button>
}


export function renderBoatInfo(time, index, setTimes, linkingIndex, setLinkingIndex, boatIds, boatDBIds){
    //renders the boat part of a list element
    if(time[1] == null){
        return<Button
                color="primary"
                size="lg"
                radius="sm"
                onPress={() => {
                    if(linkingIndex === -1)
                        setLinkingIndex(index);
                    }}
                className="self-end w-32 m-6"
                >Link Boat </Button>
    }
    return <> Boat ID: {time[1]}
                <Button
                color="warning"
                size="lg"
                radius="sm"
                onPress={() => unLinkTime(index, setTimes, boatIds, boatDBIds)}
                className="self-end w-32 m-6"
                >unLink</Button>
    </>

}

export function getCounterStr(count){
    if(count == DNF_CODE){
        return "DNF";
    }

    if(count == DNS_CODE){
        return "DNS";
    }

    if(count == UNLAPPED_CODE){
        return "No Time";
    }

    let addLeadingZero = (didgs) => {
        if(didgs.length == 1){
            didgs = "0" + didgs;
        } 
        return didgs;

    }
    let seconds = count % 60;
    let secondsString = addLeadingZero(seconds.toString());
    let minutes = (count - seconds) / 60 % 60;
    let minutesString = addLeadingZero(minutes.toString());
    let hours = (count-minutes*60-seconds) / (60*60);
    let hoursString = addLeadingZero(hours.toString());
    return hoursString + ":" + minutesString + ":" + secondsString;

}

export function findBoatDBId(boatId, boatIds, boatDBId){
    return boatDBId[boatIds.indexOf(boatId)];
}

export function addTime(count, setTimes){
    setTimes( (times) => {
            return [...times, [count, null]];
            });
    sortTimes(setTimes);
}


//TODO edit here down to call db
//links an entire to a boat
export function linkTime(index: number, boatRaceId: string, setTimes, boatIds, boatDBIds){
    let needSort = false;
    setTimes((times)=>{
            const list = times.map( (time, i) => {
                    if(index === i){
                        time[1] = boatRaceId;
                        //calls db
                        updateBoatTime(findBoatDBId(boatRaceId, boatIds, boatDBIds), time[0]); 
                        needSort = time[0] == DNS_CODE || time[0] == DNF_CODE;
                    } 

                    return time;
                    });
            return list;
            });
    if(needSort) sortTimes(setTimes);

}

export function unLinkTime(index: number, setTimes, boatIds, boatDBIds){
    let needSort = false;
    setTimes((times)=>{
            return times.map((time, i) => {
                    if(index === i){
                        let boatRaceId = time[1];
                        updateBoatTime(findBoatDBId(boatRaceId, boatIds, boatDBIds), UNLAPPED_CODE); 
                        time[1] = null;
                        needSort = time[0] == DNS_CODE || time[0] == DNF_CODE;
                    }
                    return time;
                    });
            });
    if(needSort) sortTimes(setTimes);
}

export function deleteTime(index: number, setTimes, boatIds, boatDBIds){
    //rms time from db
    setTimes((times) => {
                
            let boatRaceId = times[index][1];
            if(boatRaceId !== null)
                updateBoatTime(findBoatDBId(boatRaceId, boatIds, boatDBIds), UNLAPPED_CODE); 

            return times.filter((item, i) => i !== index);
    });
}

export function updateCountOfTime(index: number, newCount: number, setTimes, boatIds, boatDBIds){
    setTimes((times) => {
            return times.map((item, i) =>{
                if(i == index){
                    item[0] = newCount;
                    let boatRaceId = item[1];
                    if(boatRaceId !== null)
                        updateBoatTime(findBoatDBId(boatRaceId, boatIds, boatDBIds), newCount); 
                }
                return item;
            });
    });
    sortTimes(setTimes);
}

export function sortTimes(setTimes){
    //ranks by latest finish time first 
    //unlaped boats always float to the top 
    //unlinked dns and dnf also float to the top
    let sortFunc = (a, b) => {
        let a_unmarked_code = ((a[0] == DNS_CODE || a[0] == DNF_CODE) && a[1] == null);
        let b_unmarked_code = ((b[0] == DNS_CODE || b[0] == DNF_CODE) && b[1] == null);
        
        if(a_unmarked_code && b_unmarked_code) 
            return 0;

        if(a_unmarked_code)
            return -1;

        if(b_unmarked_code)
            return 1;

        if(a[0] == DNS_CODE || a[0] == DNF_CODE)
            return 1;

        if(b[0] == DNS_CODE || b[0] == DNF_CODE)
            return -1;

        if(a[0] == UNLAPPED_CODE && b[0] == UNLAPPED_CODE)
            return 0;

        if(a[0] == UNLAPPED_CODE)
            return -1;

        if(b[0] == UNLAPPED_CODE)
            return 1;

        return b[0] - a[0];
    };
    setTimes((times) => times.sort(sortFunc)); 
}


