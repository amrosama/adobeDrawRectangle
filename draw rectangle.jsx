var dlg ; 
var p, arr1, arr2, mp, o, j, r, r1, rIdx, rec;
  
  var ver10 = (version.indexOf('10') == 0);
  var err_fail_to_find_center = 0;
  var err_radius_is_larget_than_artboard = 0;
 
  //-------------------------------
main();

function main(){
  showForm();
   drawRectangle();
    return;
    }
//--------------------------------------
  function drawRectangle(){
      //sp[ ] : path items
      var sp = [];
      var col = getGray(); 
      getPathItemsInSelection(2, sp);
         //sp.length : number of items
     for(var i = 0; i <sp.length ; i++){
       // p : path points
 p = sp[i].pathPoints;
 
    // find out the center of the rectangle to draw
      arr1 = perpendicularBisector(p[0].anchor, p[2].anchor);
       if(p.length==3){ // in case triangle
      arr2 = perpendicularBisector(p[1].anchor, p[2].anchor);
    } else {
      arr2 = perpendicularBisector(p[1].anchor, p[3].anchor);
    }
 o = intersection(arr1, arr2);
    if(o.length < 1){
      err_fail_to_find_center = 1;
      continue;
    }

    // find out the radius of the circle to draw
    r = dist(p[0].anchor, o);
    r1 = dist(p[1].anchor, o);
    if(r >= r1){
      rIdx = 0;
    } else {
      rIdx = 1;
      r = r1;
    }
   var margin = 116;
   // do not draw if the radius is larger than the artboard
    with(activeDocument){
      if(r==0 || r>Math.max(width, height)){
        err_radius_is_larget_than_artboard = 1;
        continue;
      }
    }
   //draw rectangle----------------------------------------------------
        var  rec = activeDocument.activeLayer.pathItems.rectangle(o[1] +r + (1/2) *margin , o[0] - r-(1/2) *margin , r * 2 + margin, r * 2+ margin);
                                                                                              
      //---------------------------------------------------------------------- 

  
    // draw a circle
    rec = activeDocument.activeLayer.pathItems.ellipse(o[1] + r, o[0] - r, r * 2, r * 2);
    with(rec){
      filled = false;
      stroked = true;
    //  strokeColor = sp[i].stroked ? sp[i].strokeColor : col;
      strokeWidth = sp[i].strokeWidth || 1;
    }
  }

  if(err_fail_to_find_center == 1)
    alert("Some circles hadn't been drawn because of fails in calculation.");
  
  if(err_radius_is_larget_than_artboard == 1)
    alert("Some circles hadn't been drawn because of too large diameters.");
 dlg.close();
}

//-----------------------------------------------------
// extract PathItems from the selection which length of PathPoints
// is greater than "n"
function getPathItemsInSelection(n, pathes){
  if(documents.length < 1) return;
 
  var s = activeDocument.selection;
  
  if (!(s instanceof Array) || s.length < 1) {
alert("Please select at least one path");      
      }
//return;
  extractPathes(s, n, pathes);
 
}
//--------------------------------------------------------
function perpendicularBisector(p1, p2){
  var mp = getMidPnt(p1, p2);
  var arr = defline([ mp[0] - (p1[1] - mp[1]), mp[1] + (p1[0] - mp[0]) ],
                    [ mp[0] - (p2[1] - mp[1]), mp[1] + (p2[0] - mp[0]) ]);
  return arr;
}
//----------------------------------------------------------
function getMidPnt(p1, p2){
  return [ (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 ];
}
//----------------------------------------------------------
function defline(p1, p2){
  var a = p1[1] - p2[1];
  var b = p1[0] - p2[0];
  return [a, -b, b * p1[1] - a * p1[0]];
}
//-------------------------------------------------------
function extractPathes(s, pp_length_limit, pathes){
  for(var i = 0; i < s.length; i++){
    if(s[i].typename == "PathItem"
       && !s[i].guides && !s[i].clipping){
      if(pp_length_limit
         && s[i].pathPoints.length <= pp_length_limit){
        continue;
      }
      pathes.push(s[i]);
      
    } else if(s[i].typename == "GroupItem"){
      // search for PathItems in GroupItem, recursively
      extractPathes(s[i].pageItems, pp_length_limit, pathes);
      
    } else if(s[i].typename == "CompoundPathItem"){
      // searches for pathitems in CompoundPathItem, recursively
      // ( ### Grouped PathItems in CompoundPathItem are ignored ### )
      extractPathes(s[i].pathItems, pp_length_limit , pathes);
    }
  }
}
//--------------------------------------------------------
function dist(arr1, arr2) {
  return Math.sqrt(Math.pow(arr1[0] - arr2[0], 2)
                   + Math.pow(arr1[1] - arr2[1], 2));
}
//--------------------------------------------------------
function intersection(p, q){
  var d = p[0] * q[1] - p[1] * q[0];
  if(d == 0) return [];
  return [ (q[2] * p[1] - p[2] * q[1]) / d,
           (p[2] * q[0] - q[2] * p[0]) / d ];
}
// -----------------------------------------------
function getGray(){
  var col = new GrayColor();
  col.gray = 100;
 if(ver10){
    var col2 = new Color();
    col2.gray = col;
    return col2;
  }
  return col;
}
function activateEditableLayer(rec){
  var lay = activeDocument.activeLayer;
  if(lay.locked || !lay.visible) activeDocument.activeLayer = rec.layer;
}

//---------------show form--------------------------
function showForm(){
 dlg = new Window('dialog', 'Select Path Items:'); 
	dlg.location = [500,50];
	dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
	dlg.btnPnl.orientation='row';
	dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button',[15,15,115,35], 'Draw rectangle', {name:'drawRectangle'}); 
	dlg.btnPnl.buildBtn2.onClick = drawRectangle;
	 dlg.show();
   
}