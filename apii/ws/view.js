(function(window)
{
  let __package = "apii.view";
  let __name = "Workspace";

  class View extends zn.Base
  {
    constructor(options)
    {
      super(options);
      this.dialogActions=
      {
        "OKCANCEL":
        [
          {action: "ok", label: "OK", autohide: false}, 
          {action: "cancel", label: "Cancel"}, 
        ],
        "CANCEL": [{action: "cancel", label: "Cancel"}]
      };
      
      this.ws=this.emptyWS();
      let oid=Object.keys(this.ws.inspections)[0];
      this.inspection=this.ws.inspections[oid];
      
      this.tabs=[this.inspection.oid];
      this.sets=[];
    }

    init()
    {
      let view=this;
      view.setupUI();
      view.setupEventHandlers();
      view.loadWS();
    }
    
    setupUI()
    {
      let view=this;
      view.initEditors();
    }

    setupEventHandlers()
    {
      let view=this;
      view._updatePanels=()=>window.setTimeout(()=>view.updatePanels(), 10);
      view._updateTabScrollPosition=()=>window.setTimeout(()=>view.updateTabScrollPosition(), 0);
      view._saveWS=zn.utils.debounce(()=>view.saveWS(), 300);
    }

    emptyWS()
    {
      let ws={oid: zn.shortid(), name: "Untitled Workspace", descr: "", inspections:{}, untitled:[], sets:[]};
      let inspection={...this.emptyInspection('Inspection 01'), state: "open"};
      ws.inspections[inspection.oid]=inspection;
      ws.untitled=[inspection.oid];
      ws.untitledCount=1;

      return ws;
    }
    
    loadWS()
    {
      let view=this;
      if(view.options.routeValues.id==null)
      {
        let currentws=window.localStorage.getItem("/apii/currentws");
        if(currentws==null)
        {
          let ws=view.emptyWS();
          currentws=ws.oid;
          window.localStorage.setItem("/apii/workspaces", JSON.stringify([ws.oid]));
          window.localStorage.setItem("/apii/currentws", currentws);
          window.localStorage.setItem(`/apii/workspace/${ws.oid}`, JSON.stringify(ws));
        }
        window.location.hash=`#!/ws/${currentws}`;
        return;
      }
      let ws=window.localStorage.getItem(`/apii/workspace/${view.options.routeValues.id}`);
      if(ws!=null)
      {
        view.ws=JSON.parse(ws);
        view.tabs=[];
        Object.values(view.ws.inspections).forEach((inspection)=>
        {
          if(inspection.state=="open") view.tabs.push(inspection.oid);
        })
        if(view.tabs.length>0)
        {
          view.inspection=view.ws.inspections[view.tabs[0]];
          view.updatePanels();
        }
        
        view.apply();
      }
    }

    saveWS()
    {
      let view=this;
      window.localStorage.setItem(`/apii/workspace/${view.options.routeValues.id}`, JSON.stringify(zn.utils.copyObj(view.ws)));
      console.info("[APIi]", "ws checkpoint");
    }

    clearWS()
    {
      let view=this;
    }

    initEditors()
    {
      let view=this;
      var cmeditoropts=
      {
        value: "",
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        mode: "application/ld+json",  
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        viewportMargin: Infinity
      }
  
      view.editors={};

      $(`.service-req-editor`).html("");
      view.editors.request = CodeMirror($(`.service-req-editor`).get()[0],cmeditoropts);

      $(`.service-res-editor`).html("");
      view.editors.response = CodeMirror($(`.service-res-editor`).get()[0],{...cmeditoropts, readOnly: true});
    
      view.updatePanels();
    }

    updatePanels()
    {
      let view=this;

      //console.log('updating panels', view.inspection);
      view.editors.request.setValue(view.inspection.request.content);
      view.editors.response.setValue(view.inspection.response.content);
      let $leftPanel=$(".service-req");
      if(view.inspection.splitState) $leftPanel.css("flex-grow", "0").css("flex-basis", "unset").width(view.inspection.splitState.leftPanelWidth);
      else $leftPanel.css("flex-grow", "1").css("flex-basis", "0");
    }

    savePanels()
    {
      let view=this;
      view.inspection.request.content=view.editors.request.getValue();
    }

    resetPanels()
    {
      let view=this;

      view.editors.request.setValue("");
      view.editors.response.setValue("");
      let $leftPanel=$(".service-req");
      $leftPanel.css("flex-grow", "1").css("flex-basis", "0");
    }

    selectTab(oid, $evt)
    {
      let view=this;
      
      $evt && $evt.preventDefault();
      $evt && $evt.stopPropagation();

      view.savePanels();
      view.inspection=view.ws.inspections[oid];
      $(".tabs-header-track .tab[data-state='selected']").attr("data-state", "");
      $(`.tabs-header-track .tab[data-oid='${oid}']`).attr("data-state", "selected");

      $(`.inspections .inspection.selected`).removeClass("selected");
      $(`.inspections .inspection[data-ins-oid='${oid}']`).addClass("selected");

      view.updatePanels();
    }

    closeTab(oid, $evt)
    {
      let view=this;

      $evt && $evt.preventDefault();
      $evt && $evt.stopPropagation();

      view.ws.inspections[oid].state="";
      let index=view.tabs.indexOf(oid);
      view.tabs.splice(index, 1);
      view._updateTabScrollPosition();
      view._saveWS();
      if(oid!=view.inspection.oid) return;

      if(index>=view.tabs.length) index=view.tabs.length-1;
      if(index>=0) view.selectTab(view.tabs[index]);
      else
      {
        $(`.inspections .inspection.selected`).removeClass("selected");
        view.inspection={};
        view.resetPanels();
      }
    }
    
    updateTabScrollPosition()
    {
      let view=this;
      let $track=$(".tabs-header-track");
      let $strip=$(".tabs-header-strip");

      view.showTabScrollActions=$track.width() > $strip.width();
      if(view.showTabScrollActions) $track.css("left", $strip.width()-$track.width());
      else $track.css("left", 0);
      view.apply();
    }

    showTabMenu(oid, $evt)
    {
      let view=this;

      $evt && $evt.preventDefault();
      $evt && $evt.stopPropagation();

      let index=view.tabs.indexOf(oid);
      let $tab=$(`.tab[data-index="${index}"]`);
      let tabPosition=$tab.position();
      
      let $track=$(".tabs-header-track");
      let trackPosition=$track.position();

      let $strip=$(".tabs-header-strip");
      let stripPosition=$strip.position();

      let left=stripPosition.left + trackPosition.left + tabPosition.left;
      let top=stripPosition.top + trackPosition.top + tabPosition.top + 31;

      let popup=zn.ui.components.Popup.get("tab-menu");
      popup.show({left: left, top: top});
      view.tabMenuCtx={index: index, oid: oid};
    }

    onTabMenuAction(action)
    {
      let view=this;
      let popup=zn.ui.components.Popup.get("tab-menu");
      popup.hide();

      if(action=="edit") view.editInspection(view.tabMenuCtx.oid, view.tabMenuCtx.index);
      if(action=="delete") view.deleteInspection(view.tabMenuCtx.oid, view.tabMenuCtx.index);
      if(action=="duplicate") view.duplicateInspection(view.tabMenuCtx.oid, view.tabMenuCtx.index);
    }

    addRequestHeader($evt)
    {
      let view=this;

      $evt.preventDefault();
      view.inspection.request.headers.push({header: "", value: ""});
    }

    deleteRequestHeader(index, $evt)
    {
      let view=this;

      $evt.preventDefault();
      view.inspection.request.headers.splice(index, 1);
    }

    updateRequestHeader(index, type, $evt)
    {
      let view=this;
      view.inspection.request.headers[index][type]=$evt.newValue;
    }

    panelSplit($evt)
    {
      let view=this;
      if($evt.name=="dragstart")
      {
        let $leftPanel=$(".service-req");
        let $rightPanel=$(".service-res");
        view.splitState={leftPanelWidth: $leftPanel.width(), rightPanelWidth: $rightPanel.width()};
        $leftPanel.css("flex-grow", "0").css("flex-basis", "unset").width(view.splitState.leftPanelWidth);
      }
      
      if($evt.name=="dragmove")
      {
        if(view.splitState.leftPanelWidth+$evt.by.x >= 250 && view.splitState.rightPanelWidth-$evt.by.x >= 250)
          $(".service-req").width(view.splitState.leftPanelWidth+$evt.by.x);
      }

      if($evt.name=="dragend")
      {
        if(view.splitState.leftPanelWidth+$evt.by.x >= 250 && view.splitState.rightPanelWidth-$evt.by.x >= 250)
        {
          $(".service-req").width(view.splitState.leftPanelWidth+$evt.by.x);
          view.splitState.leftPanelWidth += $evt.by.x;
          view.inspection.splitState={leftPanelWidth:  view.splitState.leftPanelWidth};
        }
      }
    }

    emptyInspection(name)
    {
      return {
        name: name || 'Inspection',
        oid: zn.shortid(),
        target: {},
        request:
        {
          headers:[{header: "", value: ""},{header: "", value: ""},{header: "", value: ""}],
          content: ""
        },
        response:
        {
          headers:[{header: "", value: ""},{header: "", value: ""},{header: "", value: ""}],
          content: ""
        }
      }
    }

    addMockInspectionTab()
    {
      let view=this;
      view.ws.untitledCount = (view.ws.untitledCount + 1) % view.mockData.list.length;
      
      let mockInspection=JSON.parse(JSON.stringify(view.mockData.list[view.ws.untitledCount]));
      mockInspection.oid=zn.shortid();
      view.ws.inspections.push(mockInspection);
      view.inspection=view.ws.inspections[view.ws.inspections.length-1];
      view.tabs.push(view.ws.inspections.length-1);
      
      view._updatePanels();
      view._updateTabScrollPosition();
    }

    addQuickInspectionTab()
    {
      let view=this;
      view.ws.untitledCount++;
      
      let inspection=view.emptyInspection(`Inspection ${Math.floor(view.ws.untitledCount/10)}${view.ws.untitledCount%10}`);
      view.ws.inspections[inspection.oid]=inspection;
      
      let untitledList=view.ws.untitled=view.ws.untitled || [];
      untitledList.push(inspection.oid);

      view.saveWS();
      view.showInspection(inspection.oid);
    }

    scrollTabsLeft()
    {
      let $track=$(".tabs-header-track");
      let $strip=$(".tabs-header-strip");

      if($track.width() <= $strip.width()) return;

      let left=$track.position().left;
      left += 50;
      if(left>0) left=0;
      $track.css("left", left);
    }
    
    scrollTabsRight()
    {
      let $track=$(".tabs-header-track");
      let $strip=$(".tabs-header-strip");

      if($track.width() <= $strip.width()) return;

      let left=$track.position().left;
      left -= 50;
      if($track.width()+left < $strip.width()) left=$strip.width()-$track.width();
      $track.css("left", left);
    }

    editInspection(oid)
    {
      let view=this;
      let ins=view.ws.inspections[oid];
      view.showEditInspectionDialog(ins.setOid ? 'edit' : 'edit-untitled', oid, ins.setOid);
    }

    deleteInspection(oid)
    {
      let view=this;
      let inspection=view.ws.inspections[oid];
      if(inspection.state=="open") view.closeTab(oid);
      
      if(inspection.setOid)
      {
        let setIndex=view.ws.sets.findIndex(set=>set.oid==inspection.setOid);
        let index=view.ws.sets[setIndex].inspections.indexOf(oid);
        view.ws.sets[setIndex].inspections.splice(index, 1);
      }
      else
      {
        let index=view.ws.untitled.indexOf(oid);
        view.ws.untitled.splice(index, 1);
      }
      
      delete view.ws.inspections[oid];
      view._saveWS();
    }

    duplicateInspection(oid, index)
    {
      let view=this;
      view.showEditInspectionDialog('duplicate', oid);
    }

    showEditSetDialog(mode, index, $evt)
    {
      let view=this;

      $evt && $evt.preventDefault();
      $evt && $evt.stopPropagation();

      if(mode=='new') view.editset={type: 'new'};
      else
      {
        let set=view.ws.sets[index];
        view.editset={type:'edit', name: set.name, descr: set.descr, index: index};
      }
      let dialog=zn.ui.components.Dialog.get("edit-set-dialog");
      dialog.setTitle(view.editset.type=='new' ? 'Add Set' : 'Edit Set');
      dialog.show();
    }

    onEditSetDialogAction($evt)
    {
      let view=this;
      if($evt.action=="cancel") return;

      if(!view.editset.name)
      {
        view.editset.error={name: "Name is required"};
        view.apply();
        return;
      }
      else zn.ui.components.Dialog.get("edit-set-dialog").hide();

      if(view.editset.index!=null)
      {
        let set=view.ws.sets[view.editset.index];
        set.name=view.editset.name;
        set.descr=view.editset.descr;
      }
      else view.ws.sets.push({oid: zn.shortid(), name: view.editset.name, descr: view.editset.descr, inspections: []});
      console.log(view.ws.sets);
      view.apply();
      view.saveWS();
    }
  
    showEditWSDialog(mode)
    {
      let view=this;
      if(mode=='new') view.editws={type: "new"};
      else view.editws={type: "edit", name: view.ws.name, descr: view.ws.descr};

      let dialog=zn.ui.components.Dialog.get("edit-ws-dialog");
      dialog.setTitle(mode == 'new' ? 'Add Workspace': 'Edit Workspace');
      dialog.show();
    }

    onEditWSDialogAction($evt)
    {
      let view=this;
      if($evt.action=="cancel") return;

      if(!view.editws.name)
      {
        view.editws.error={name: "Name is required"};
        view.apply();
        return;
      }
      else zn.ui.components.Dialog.get("edit-ws-dialog").hide();

      if(view.editws.type=="new") view.addWorkspace(view.editws);
      else view.updateWorkspace(view.editws);
      
      view.saveWS();
    }

    addWorkspace(obj)
    {
      let view=this;
      let ws=view.emptyWS();
      ws.name=obj.name;
      ws.descr=obj.descr;
      let workspaces=JSON.parse(window.localStorage.getItem("/apii/workspaces"));
      workspaces.push(ws.oid);

      window.localStorage.setItem("/apii/workspaces", JSON.stringify(workspaces));
      window.localStorage.setItem("/apii/currentws", ws.oid);
      window.localStorage.setItem(`/apii/workspace/${ws.oid}`, JSON.stringify(ws));

      window.location.hash=`#!/ws/${ws.oid}`;
    }

    updateWorkspace(obj)
    {
      let view=this;
      view.ws.name=obj.name;
      view.ws.descr=obj.descr;
      view.apply();
    }

    deleteWorkspace()
    {
      let view=this;
      let oid=view.ws.oid;

      let workspaces=JSON.parse(window.localStorage.getItem("/apii/workspaces"));
      let index=workspaces.indexOf(oid);
      workspaces.splice(index, 1);

      let currentws=workspaces[0];
      window.localStorage.setItem("/apii/workspaces", JSON.stringify(workspaces));
      window.localStorage.setItem("/apii/currentws", currentws);
      window.localStorage.removeItem(`/apii/workspace/${oid}`);

      window.location.hash=`#!/ws/${currentws}`;
    }

    listWorkspaces()
    {
      let workspaces=JSON.parse(window.localStorage.getItem("/apii/workspaces"));
      let list=[];
      workspaces.forEach((oid)=>
      {
        let ws=JSON.parse(window.localStorage.getItem(`/apii/workspace/${oid}`));
        list.push({text: ws.name, subtext: ws.descr, oid: ws.oid});
      })

      return list;
    }

    showEditInspectionDialog(mode, oid, setOid, $evt)
    {
      let view=this;

      $evt && $evt.preventDefault();
      $evt && $evt.stopPropagation();

      view.editinspection={type: mode, oid: oid, setOid: setOid};
      if(oid)
      {
        let inspection=view.ws.inspections[oid];
        view.editinspection.name=inspection.name;
        view.editinspection.descr=inspection.descr;
      }
      if(mode=="duplicate") view.editinspection.name += " copy";

      view.sets=view.ws.sets.map((set)=>{return {value: set.oid, label: set.name}});

      let dialog=zn.ui.components.Dialog.get("edit-inspection-dialog");
      dialog.setTitle(view.editinspection.type=='new' ? 'Add Inspection' : 'Edit Inspection');
      dialog.show();
    }

    onEditInspectionDialogAction($evt)
    {
      let view=this;
      if($evt.action=="cancel") return;
      
      view.editinspection.error={};
      if(!view.editinspection.name) view.editinspection.error={name: "Name is required"};
      if(!view.editinspection.setOid) view.editinspection.error={setOid: "Set is required"};

      if(view.editinspection.error.name || view.editinspection.error.setOid)
      {
        view.apply();
        return;
      }
      else zn.ui.components.Dialog.get("edit-inspection-dialog").hide();

      if(view.editinspection.type=='new') view.addInspection(view.editinspection);
      else if(view.editinspection.type=='edit') view.updateInspection(view.editinspection);
      else if(view.editinspection.type=='edit-untitled') view.updateQuickInspection(view.editinspection);
      else if(view.editinspection.type=='duplicate') view.copyInspection(view.editinspection);

      view._saveWS();
    }

    addInspection(obj)
    {
      let view=this;
      let inspection=
      {
        ...view.emptyInspection(obj.name),
        oid: zn.shortid(),
        setOid: obj.setOid,
        descr: obj.descr
      }
      let setIndex=view.ws.sets.findIndex(set=>set.oid==obj.setOid);
      let set=view.ws.sets[setIndex];
      view.ws.inspections[inspection.oid]=inspection;
      let setInspections=set.inspections=set.inspections || [];
      setInspections.push(inspection.oid);
      view.apply();
      view.showInspection(inspection.oid);
    }
    
    updateInspection(obj)
    {
      let view=this;

      let ins=view.ws.inspections[obj.oid];
      ins.name=obj.name;
      ins.descr=obj.descr;
      let setIndex=view.ws.sets.findIndex(set=>set.oid==ins.setOid);
      let set=view.ws.sets[setIndex];
      if(ins.setOid!=obj.setOid) view.moveToInspectionSet(set.inspections, ins, obj.setOid);
      view.apply();
    }

    updateQuickInspection(obj)
    {
      let view=this;
      let ins=view.ws.inspections[obj.oid];
      ins.name=obj.name;
      ins.descr=obj.descr;
      if(obj.setOid) view.moveToInspectionSet(view.ws.untitled, ins, obj.setOid);
      view.apply();
    }

    moveToInspectionSet(fromList, ins, targetSetOid)
    {
      let view=this;
      let sets=view.ws.sets;

      let insIndex=fromList.indexOf(ins.oid);
      let targetSetIndex=sets.findIndex(set=>set.oid==targetSetOid);

      fromList.splice(insIndex, 1);
      sets[targetSetIndex].inspections.push(ins.oid);
      ins.setOid=targetSetOid;
    }

    copyInspection(obj)
    {
      let view=this;
      let inspection=zn.utils.copyObj(view.ws.inspections[obj.oid]);
      inspection.oid=zn.shortid();
      inspection.name=obj.name;
      inspection.descr=obj.descr;
      inspection.setOid=obj.setOid;
      inspection.state="";

      let setIndex=view.ws.sets.findIndex(set=>set.oid==obj.setOid);
      let set=view.ws.sets[setIndex];
      view.ws.inspections[inspection.oid]=inspection;
      let setInspections=set.inspections=set.inspections || [];
      setInspections.push(inspection.oid);

      view.apply();
      view.showInspection(inspection.oid);
    }

    showInspection(oid, $evt)
    {
      let view=this;
      $evt && $evt.stopPropagation();
      
      $(`.inspections .inspection.selected`).removeClass("selected");
      $(`.inspections .inspection[data-ins-oid='${oid}']`).addClass("selected");
      
      if(oid && view.inspection.oid==oid) return;
      if(view.ws.inspections[oid].state=="open")
      {
        view.selectTab(oid);
        return;
      }

      view.inspection=view.ws.inspections[oid];
      view.inspection.state="open";
      view.tabs.push(oid);
      
      view._updatePanels();
      view._updateTabScrollPosition();
      view._saveWS();
    }

    deleteSet(index, $evt)
    {
      let view=this;
      $evt.stopPropagation();

      let set=view.ws.sets[index];
      if(set.inspections) for(let i=0, l=set.inspections.length; i<l; i++) view.deleteSetInspection(index, 0)
      view.ws.sets.splice(index, 1);
      view._saveWS();
    }

    deleteSetInspection(setIndex, index, $evt)
    {
      let view=this;
      $evt && $evt.stopPropagation();
      
      view.deleteInspection(view.ws.sets[setIndex].inspections[index]);
      //view.ws.sets[setIndex].inspections.splice(index, 1);
      //view._saveWS();
    }

    deleteQuickInspection(index, $evt)
    {
      let view=this;
      $evt && $evt.stopPropagation();

      view.deleteInspection(view.ws.untitled[index]);
      //view.ws.untitled.splice(index, 1);
      //view._saveWS();
    }

    toggleSet(setOid, $evt)
    {
      $evt && $evt.preventDefault();
      $evt && $evt.stopPropagation();
      
      let $set=$(`.set[data-set-oid='${setOid}']`);
      if($set.attr("data-state")=="expanded") $set.attr("data-state", "collapsed");
      else $set.attr("data-state", "expanded");
    }

    send($event)
    {
      let view=this;
      view.savePanels();
      view.saveWS();
    }

    showAppMenu($evt)
    {
      let view=this;
  
      $evt && $evt.preventDefault();
      $evt && $evt.stopPropagation();
  
      let popup=zn.ui.components.Popup.get("app-menu");
      popup.show();
    }

    onAppMenuAction(action)
    {
      let view=this;
      let popup=zn.ui.components.Popup.get("app-menu");
      popup.hide();

      if(action=="new-ws") view.showEditWSDialog('new');
      if(action=="switch-ws") view.showSelectWSDialog();
      if(action=="import-ws") console.log('import ws');
      if(action=="export-ws") console.log('export ws');
      if(action=="prefs") console.log('prefs');
    }

    showSelectWSDialog()
    {
      let view=this;
      view.wslist=view.listWorkspaces();
      let dialog=zn.ui.components.Dialog.get("ws-list-dialog");
      dialog.show();
    }

    onSelectWS($event)
    {
      let oid=$event.item.oid;
      window.location.hash=`#!/ws/${oid}`;
    }
  }


  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = View;

})(window);

