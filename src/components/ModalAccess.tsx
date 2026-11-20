'use client';
import {useEffect} from 'react';
/** Shared keyboard contract for existing modal shells, without replacing their game state. */
export function ModalAccess(){
 useEffect(()=>{
  let active:HTMLElement|null=null,previous:HTMLElement|null=null;
  const oldOverflow=document.body.style.overflow;
  const focusable=(node:HTMLElement)=>Array.from(node.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')).filter(x=>x.getClientRects().length);
  const sync=()=>{
   const dialogs=Array.from(document.querySelectorAll<HTMLElement>('[aria-modal="true"]')).filter(x=>x.getClientRects().length);
   const next=dialogs.at(-1)??null;
   if(next===active)return;
   if(next){if(!active)previous=document.activeElement as HTMLElement;active=next;document.body.style.overflow='hidden';if(!next.contains(document.activeElement))focusable(next)[0]?.focus();}
   else{active=null;document.body.style.overflow=oldOverflow;if(previous?.isConnected)previous.focus();}
  };
  const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true});sync();
  const key=(e:KeyboardEvent)=>{
   if(!active)return;
   if(e.key==='Escape'){const close=active.querySelector<HTMLButtonElement>('.modal-x,button[aria-label*="닫기"]');if(close){e.preventDefault();close.click();}return;}
   if(e.key!=='Tab')return;
   const items=focusable(active);if(!items.length){e.preventDefault();return;}
   const index=items.indexOf(document.activeElement as HTMLElement);
   if(e.shiftKey&&index<=0){e.preventDefault();items.at(-1)!.focus();}
   else if(!e.shiftKey&&(index===items.length-1||index<0)){e.preventDefault();items[0].focus();}
  };
  document.addEventListener('keydown',key);
  return()=>{observer.disconnect();document.removeEventListener('keydown',key);document.body.style.overflow=oldOverflow;};
 },[]);
 return null;
}
