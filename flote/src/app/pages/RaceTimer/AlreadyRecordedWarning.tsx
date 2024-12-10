import { Button } from "@nextui-org/react";

export function AlreadyRecordedWarning({alreadyRec, setAlreadyRec}){
    if(!alreadyRec)
        return <></>
    
    return <>
        <div className="bg-slate-400/50 w-screen h-screen fixed flex items-center justify-center">
            <div className = "p-8 w-[50%] rounded-md bg-white flex flex-col max-h-[80%]">
                <div className = "flex flex-row flex-wrap justify-between">
                    <h1 className="text-2xl">Warning: this race has already been recorded. Starting it will override data </h1>
                    <Button
                        color="danger"
                        size="lg"
                        radius="sm"
                        onPress={() => {
                            setAlreadyRec((x) => false);
                            }
                        }
                        className="self-end w-32"
                        >Close</Button>
                </div>
            </div> 
        </div>
    </>

}
