var env = new Object();
    env.height = 30;
    env.width = 30;
    env.area = env.height * env.width;
    env.cellcount = 1;
    env.cells = [];
    env.cols_arr = [];
    env.rows_arr = [];

    env.instantiate = function() {
        var rowcount = 0;
        var tr = "<tr id=\"" + rowcount + "\"></tr>";
        for (i = 0; i < env.area; i++) {
            if ($(tr).children("td").length == env.width) {
                $("#universe").append(tr);
                rowcount++;
                tr = "<tr id=\""+ rowcount +"\"></tr>";
            }
            var td = "<td id=\"" + i + "\" class=\"sqmeter\"></td>";

            tr = $(tr).append(td);
        }
        for (i = 0; i < env.width; i++) {env.cols_arr.push(i)};
        for (i = 0; i < env.area; i += env.height) {env.rows_arr.push(i)};
        $("#universe").append(tr);
    };

// Cell constructor
function Cell(prosp_range, name, test_loc) {

    this.nucleus = new Object();
    this.nucleus.name = ""; // set by instantiate()
    this.nucleus.location = Math.floor(Math.random() * env.area) + 1;
    this.nucleus.location = test_loc; // For testing
    this.nucleus.stamina = 100; // default: 100
    this.nucleus.range_diam = 0;
    this.nucleus.range_radius = 0;
    this.nucleus.range_area = 0;
    this.nucleus.prospective_range = 0; // set by instantiate(), default: 3
    this.nucleus.wander_preference = 1;
    this.nucleus.wander_rate = 100; // defaults: 100, 1000
    this.nucleus.pathmem = 10;  // default: 20
    this.nucleus.range = []; // set by findrange()
    this.nucleus.range_outer = []; // set by findrange_outer()

    // Instantiate cell range size, length should equal width, and both should be odd
    this.nucleus.set_range_diam_radius = function() {
        if ((this.prospective_range % 2) == 1) {
            this.range_diam = this.prospective_range;
        } else {
            this.range_diam = (this.prospective_range + 1);
        }
        this.range_radius = Math.floor(this.range_diam/2);
        this.range_area = this.range_diam * this.range_diam;
    };
    
    // Finds the range a cell should have, given its current locations
    this.nucleus.findrange = function() {
        var range = [];
        this.set_range_diam_radius();
        
        for (i = -this.range_radius; i < (this.range_radius + 1); i++) {
            var temp_range = [];
            var arr_start = (this.location - this.range_radius) + (env.height * i);
            for (j = 0; j < this.range_diam; j++) {
                temp_range.push(arr_start + j);
            }
            range = range.concat(temp_range);
        }

        // Earth is round (this.nucleus.range)
        for (i = 0; i < range.length; i++) {
            if (range[i] < 0) {
                range[i] = env.area + range[i];
            } else if (range[i] > (env.area - 1)) {
                range[i] = range[i] - env.area;
            }
        }
        this.range = range;
        this.findrange_outer();
    };
    
    // Finds the "outer range" where the cell can sense whether or not it's retracing its path
    this.nucleus.findrange_outer = function() {
        var outer_range = new Object();
        
        var temp_arr_0 = this.range.slice(0, this.range_diam);
        for (i = 0; i < temp_arr_0.length; i++) {
            temp_arr_0[i] = temp_arr_0[i] - env.height;
        }
        outer_range[0] = temp_arr_0;
        
        var temp_arr_1 = [];
        for (i = 0; i < this.range_area; i += this.range_diam) {
            temp_arr_1.push(this.range[i] - 1);
        }
        outer_range[1] = temp_arr_1;
        
        var temp_arr_2 = [];
        for (i = this.range_diam - 1; i < this.range_area; i += this.range_diam) {
            temp_arr_2.push(this.range[i] + 1);
        }
        outer_range[2] = temp_arr_2;
        
        var temp_arr_3 = this.range.slice(this.range.indexOf(this.range[this.range_area - this.range_diam]));
        for (i = 0; i < temp_arr_3.length; i++) {
            temp_arr_3[i] = temp_arr_3[i] + env.height;
        }
        outer_range[3] = temp_arr_3;
        
        this.range_outer = outer_range;
    };
    
    // Concerns basic movement and caclulations 1 move operation at a time
    this.nucleus.move_left = function() {this.location = this.location - 1; this.calcmove();};
    this.nucleus.move_right = function() {this.location = this.location + 1; this.calcmove();};
    this.nucleus.move_up = function() {this.location = this.location - env.height; this.calcmove();};
    this.nucleus.move_down = function() {this.location = this.location + env.height; this.calcmove();};
    this.nucleus.calcmove = function() {

        // Earth is round (this.location)
        if (this.location < 0) {
            this.location = env.area + this.location;
        } else if (this.location > (env.area - 1)) {
            this.location = this.location - env.area;
        }

        $(".cell_" + this.name).removeClass("cell_" + this.name);
        $(".sqmeter").eq(this.location).addClass("cell_" + this.name);
        $(".range_" + this.name).removeClass("range_" + this.name);

        this.pathmem_decay();

        this.findrange(this.location, this.prospective_range);
        for (i = 0; i < this.range.length; i++) {

            $(".sqmeter").eq(this.range[i]).addClass("range_" + this.name + " remembered_" + this.name);
            $(".range_" + this.name).data("ttl_" + this.name, this.pathmem);
        }
        
        //this.upkeep("move"); // re-employ later
    };
    
    // Path of remembered ranges is eventually forgotten
    this.nucleus.pathmem_decay = function() {
        var this_name = this.name;
        $(".remembered_" + this_name).each(function() {
            var ttl_str = "ttl_" + this_name;
            var ttl = $(this).data(ttl_str) - 1;
            if (ttl >= 0) {
                $(this).data("ttl_" + this_name, ttl);
            }
            if (ttl == 0) {
                $(this).removeClass("remembered_" + this_name);
            }
        });
    };
    
    // Start automated movement 
//    this.nucleus.setwander = function() {setInterval((function(scope){return function(){scope.wander()};})(this), (function(scope){return function(){scope.wander_rate};})(this))};
//    this.nucleus.setwander = function() {setInterval((function(scope){return function(){scope.wander()};})(this), this.wander_rate)};
    this.nucleus.setwander = function() {
        setTimeout((function(scope){return function(){scope.wander()};})(this), a.nucleus.wander_rate);
    };
    
    // Automated movement (smart wander)
    this.nucleus.wander = function() {
//        console.log(this.wander_rate);
//        console.log(this.stamina);
        var bigarr = [];
        this.findrange_outer();
        var memcount_arr = [];
        for (var key in this.range_outer) {
            var memcount = 0;
            for (i = 0; i < this.range_outer[key].length; i++) {
                if ($(".sqmeter").eq(this.range_outer[key][i]).hasClass("remembered_" + this.name)) {
                    memcount++;
                }
            }
            memcount_arr.push(100 - Math.round(((memcount / this.range_outer[key].length) + 0.00001) * 100));
        }

        var allequal = true;
        for (i = 0; i < memcount_arr.length; i++) {
            for (j = 0; j < memcount_arr[i]; j++) {
                bigarr.push(i);
            }
            if (memcount_arr[i] != memcount_arr[0]) {
                allequal = false;
            }
        }

        if (!allequal) {
            var move = bigarr[Math.floor(Math.random() * bigarr.length)];
            if (move == 0) {this.move_up()}
            else if (move == 1) {this.move_left()}
            else if (move == 2) {this.move_right()}
            else if (move == 3) {this.move_down()}
        } else {
            var move = Math.floor(Math.random() * 4);
            if (move == 0) {this.move_up()}
            else if (move == 1) {this.move_left()}
            else if (move == 2) {this.move_right()}
            else if (move == 3) {this.move_down()}
        }

        setTimeout((function(scope){return function(){scope.wander()};})(this), this.wander_rate);
    };
    
            // directed wander
            this.nucleus.target_location = null;
            this.nucleus.loc_rel_to_targ = [];
            //old
//            this.nucleus.set_target_loc = function(targ_loc) {
//                this.target_location = targ_loc;
//                this.loc_rel_to_targ = detdifference(this.location, targ_loc);
//                $(".sqmeter").eq(targ_loc).addClass("target");
//            };
            this.nucleus.set_target_loc = function(targ) {
                this.targ = targ;
                this.target_location = targ.nucleus.location;
                this.loc_rel_to_targ = detdifference(this.location, this.target_location);
                $(".sqmeter").eq(this.target_location).addClass("target");
            };
    
            this.nucleus.setwander_directed = function(target) {
                setTimeout((function(scope){return function(){scope.wander_directed(target)};})(this), a.nucleus.wander_rate);
            };
    
            this.nucleus.wander_directed = function(target) {
                var bigarr = [];
                this.findrange_outer();
                var memcount_arr = [];
                for (var key in this.range_outer) {
                    var memcount = 0;
                    for (i = 0; i < this.range_outer[key].length; i++) {
                        if ($(".sqmeter").eq(this.range_outer[key][i]).hasClass("remembered_" + this.name)) {
                            memcount++;
                        }
                    }
                    memcount_arr.push(100 - Math.round(((memcount / this.range_outer[key].length) + 0.00001) * 100));
                }
                
                console.log(memcount_arr);
                
                // bigarr calculation
                var allequal = true;
                for (i = 0; i < memcount_arr.length; i++) {
                    for (j = 0; j < memcount_arr[i]; j++) {
                        bigarr.push(i);
                    }
                    if (memcount_arr[i] != memcount_arr[0]) {
                        allequal = false;
                    }
                }

                // addition of goal-oriented weights
                this.set_target_loc(target);
                var x_direction, y_direction;
                if (this.loc_rel_to_targ[0] < 0) {x_direction = 1;}
                else {x_direction = 2;}
                if (this.loc_rel_to_targ[1] < 0) {y_direction = 0;}
                else {y_direction = 3;}
                for (i = 0; i < (Math.abs(this.loc_rel_to_targ[0]) * 100); i++) {
                    bigarr.push(x_direction); //console.log("" + this.loc_rel_to_targ[0]);
                }
                for (i = 0; i < (Math.abs(this.loc_rel_to_targ[1]) * 100); i++) {
                    bigarr.push(y_direction); //console.log(this.loc_rel_to_targ[1]);
                }
                if (bigarr.length > 0) {allequal = false;}
                
                oldbarr = bigarr;
                // avoid obstacles
                bigarr = this.avoid_obstacles(bigarr);
                newbarr = bigarr;
                //console.log(bigarr);
                
                if (!allequal) {
                    var bigar_index = Math.floor(Math.random() * bigarr.length);
                    var move = bigarr[bigar_index];
                    if (move == 0) {
                        if ($(".sqmeter").eq(this.location - env.height).hasClass("obstacle")) {
                            console.log("failed: " + bigar_index);
                        }
                        this.move_up();
                    }
                    else if (move == 1) {
                        if ($(".sqmeter").eq(this.location - 1).hasClass("obstacle")) {
                            console.log("failed: " + bigar_index);
                        }
                        this.move_left();
                    }
                    else if (move == 2) {
                        if ($(".sqmeter").eq(this.location + 1).hasClass("obstacle")) {
                            console.log("failed: " + bigar_index);
                        }
                        this.move_right();
                    }
                    else if (move == 3) {
                        if ($(".sqmeter").eq(this.location + env.height).hasClass("obstacle")) {
                            console.log("failed: " + bigar_index);
                        }
                        this.move_down();
                    }
                } else {
                    var move = Math.floor(Math.random() * 4);
                    if (move == 0) {this.move_up()}
                    else if (move == 1) {this.move_left()}
                    else if (move == 2) {this.move_right()}
                    else if (move == 3) {this.move_down()}
                }
                //setTimeout((function(scope){return function(){scope.wander_directed(target)};})(this), this.wander_rate);
            };
    
            // rewrite to do modifications on memcount_arr instead of bigarr
            this.nucleus.avoid_obstacles = function(bigarr) {
                var new_bigarr = bigarr;
                var check_arr = [this.location - 30, this.location - 1, this.location + 1, this.location + 30];
                //console.log(check_arr);
                for (i = 0; i < check_arr.length; i++) {
                    //var turn;
                    //if (i == 0) {turn = }
                    if ($(".sqmeter").eq(check_arr[i]).hasClass("obstacle")) {
                        new_bigarr = new_bigarr.filter(function(element) {
                            return element !== i;
                        });
                    }
                }
                return new_bigarr;
            };
                
            // rewrite to do modifications on memcount_arr instead of bigarr
            this.nucleus.next_mode = function(bigarr) {
                var mode_arr = [];
                for (i = 0; i < bigarr.length; i++) {
                    if (!mode_arr.includes(bigarr[i])) {
                        mode_arr.push
                    }
                    
                }
            }
    
    this.nucleus.reaction_moveweight = function(target_location, reaction_type) {
        
    };
    

    
    // Instantiate cell and its range
    this.nucleus.instantiate = function(name, prosp_range) {
        try {
            if (prosp_range >= 1 && prosp_range <= 9 && !env.cells.includes(String(name))) {
                this.name = String(name);
                env.cells.push(this.name);
                this.prospective_range = prosp_range;
                this.findrange();
                this.findrange_outer();
                $(".sqmeter").eq(this.location).addClass("cell_" + this.name);

                for (i = 0; i < this.range.length; i++) {
                    $(".sqmeter").eq(this.range[i]).addClass("range_" + this.name + " remembered_" + this.name);
                    $(".sqmeter").eq(this.range[i]).data("ttl_" + this.name, this.pathmem);
                }
            } else {
                throw new Error("Invalid new cell");
            }
            
        } catch(e) {
            console.error(e);
        }
    };
    
    this.nucleus.upkeep = function(action_taken) {
        if (action_taken = "move") {
            this.stamina--;
            this.wander_rate += 5;
        }
        if (this.stamina == 0) {
            this.die();
        }
    };
    
    this.nucleus.die = function() {
        console.log("died");
        this.name = null;
        this.location = null;
        this.stamina = null;
        this.range_diam = null;
        this.range_radius = null;
        this.range_area = null;
        this.prospective_range = null;
        this.wander_preference = null;
        this.wander_rate = null;
        this.pathmem = null;
        this.range = null;
        this.range_outer = null;
        
        this.set_range_diam_radius = null;
        this.findrange = null;
        this.findrange_outer = null;
        this.move_left = null;
        this.move_right = null;
        this.move_up = null;
        this.move_down = null;
        this.calcmove = null;
        this.pathmem_decay = null;
        this.setwander = null;
        this.wander = null;
        this.upkeep = null;
        this.die = null;
        this.instantiate = null;
    };
    
    this.nucleus.instantiate(prosp_range, name);
}

function Obst(start_loc, end_loc) {
    this.loc = get_area_array(start_loc, end_loc);
    this.inst = function() {
        for (i = 0; i < this.loc.length; i++) {
            $(".sqmeter").eq(this.loc[i]).addClass("obstacle");
        }
    }
    
    this.inst();
}

var a = "";
var ddd = "";
$(window).on("load", function() {
    env.instantiate();
//    a = new Cell("a", 3);
//    b = new Cell("b", 3);
    a = new Cell("a", 3, 145); // hard-coded for testing obstacles
    b = new Cell("b", 3, 666); // hard-coded for testing obstacles
    a.nucleus.set_target_loc(b);
    b.nucleus.set_target_loc(a);
    ddd = new Obst(310, 619);
});

$(document).on("keydown", function(e) {
    if (e.keyCode == '38') {
        // up arrow
        //a.nucleus.move_up();
        //cell.nucleus.wander_smart();
        a.nucleus.wander_directed(b);
    }
    else if (e.keyCode == '40') {
        // down arrow
//        a.nucleus.move_down();
        //cell.nucleus.wander_smart();
        ///////
        a.nucleus.setwander_directed(b);
        b.nucleus.setwander_directed(a);
        ///////
//        a.nucleus.wander_directed(b);
    }
    else if (e.keyCode == '37') {
       // left arrow
        //a.nucleus.move_left();
        //cell.nucleus.wander_smart();
        a.nucleus.wander_directed(b);
    }
    else if (e.keyCode == '39') {
       // right arrow
        //a.nucleus.move_right();
        //cell.nucleus.wander_smart();
        a.nucleus.wander_directed(b);
    }
});


// determine cell row
function detrelloc(location) {
    var col_loc = location;
    var row_loc = location;
    
    while (!env.cols_arr.includes(col_loc)) {
        col_loc -= env.height;
    }
    row_loc = row_loc - col_loc;
    return [col_loc, row_loc];
}

function detdifference(start_location, target_location) {
    start_origin_offsets = detrelloc(start_location);
    targ_origin_offsets = detrelloc(target_location);
    
    start_origin_offsets[1] = start_origin_offsets[1] /= env.height;
    targ_origin_offsets[1] = targ_origin_offsets[1] /= env.height;
    
    var difference =
    [(targ_origin_offsets[0] - start_origin_offsets[0]),
    (targ_origin_offsets[1] - start_origin_offsets[1])];
    
    if (difference[0] < 0) {difference[0]--;}
    else {difference[0]++;}
    if (difference[1] < 0) {difference[1]--;}
    else {difference[1]++;}
    
    return difference;
    
}

function get_area_array(start_coord, end_coord) {
    var area_array = [];
    var arr = detdifference(start_coord, end_coord);
    for (i = 0; i < arr[1]; i++) {
        for (j = 0; j < arr[0]; j++) {
            area_array.push(start_coord + j);
        }
        start_coord += env.height;
    }
    return area_array;
}