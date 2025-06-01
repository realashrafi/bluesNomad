/* eslint-disable */
'use client'
import { useMemo } from 'react';


const useFilteredStages = (stages:any, excludedIds:any) => {
    return useMemo(() => {
        return stages.filter((stage:any) => excludedIds.includes(stage.id));
    }, [stages, excludedIds]);
};

export default useFilteredStages;