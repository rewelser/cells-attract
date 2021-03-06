/*

The organism has fundamental reactions to stimuli:
    1. Appetitive
    2. Aversive
    
    - Rather than a programmed, direct reaction to a stimulus, these responses are in fact responses to physical states within the organism which are themselves caused by the stimuli.
    - Sometimes the physical state causes a low-level effect in its local scope, but the whole cell behaves as one (or does it? Can a cell "feel" "conflicted" (have two flagellae pushing it in opposite directions due to opposing stimuli)?).
        +  The nucleus maintains the integrity of genes and controls the activities of the cell by regulating gene expression - Wikipedia
        +
        
        
SIMPLE MODEL:
- All threats have the same threat level
- All food has the same nutrient level

- If stamina = (50, 100):
    - The cell prefers aversion to appetition
- If stamina = (0, 50]:
    - The cell prefers appetition to aversion
    
MORE ADVANCED:
- 3 threat levels, 3 nutrient levels: (1, 2, 3)

Scenario: T3 and N3 in same location, Stamina 50
    - Cell remains still
*/





//var cell = new Object();
//var nucleus = new Object();
//var cilia = new object();
//
//cell = {
//    n
//}
//nucleus = {
//    // variable data, necessarily redundant until heuristics can be established conceptually
//    // [data] factors
//    stamina: 100,
//    aversive_factor: 5,     // linear for now, but must ultimately be nonlinear
//    appetitive_factor: 5,   // linear for now, but must ultimately be nonlinear
//    
//    // actions
//    getResponse: function() {
//        if 
//    },
//
//    feed: function() {
//        this.stamina += 30;
//        this.adjustFactors();
//        
//    },
//    
//    adjustFactors: function() {
//        var old_stam = this.stamina;
//        
//        if (this.stamina > 100) {this.stamina = 100;}
//        else if (this.stamina < 0) {this.stamina = 0;}
//        
////        if (this.stamina < 60 && old_stam = 60) {
////            this.aversive_factor --;
////            this.appetitive_factor ++;
////        }
//        
//    },
//}

$(window).on("load", function() {
    instantiate_environment();
});
var env = new Object();
    env.height = 30;
    env.width = 30;
    env.area = env.height * env.width;
    env.cellcount = 1;
var cell = new Object();
    cell.nucleus = new Object();
    cell.nucleus.location = Math.floor(Math.random() * env.area) + 1;
    cell.nucleus.stamina = 100; // default: 100
    cell.nucleus.range_diam = 0;
    cell.nucleus.range_radius = 0;
    cell.nucleus.range_area = 0;
    cell.nucleus.prospective_range = 3; // default: 9
    cell.nucleus.wander_preference = 1;
    cell.nucleus.wander_rate = 100;    // default: 1000
    cell.nucleus.pathmem = 20;
    cell.nucleus.range = [];    // set by findrange()
    cell.nucleus.set_range_diam_radius = function(nbr) {
        if ((nbr % 2) == 1) {
            cell.nucleus.range_diam = nbr;
        } else {
            cell.nucleus.range_diam = (nbr + 1);
        }
        cell.nucleus.range_radius = Math.floor(cell.nucleus.range_diam/2);
        cell.nucleus.range_area = cell.nucleus.range_diam * cell.nucleus.range_diam;
    };


    cell.nucleus.findrange = function(cell_location, nbr) {
        var range = [];
        cell.nucleus.set_range_diam_radius(nbr);
        
        for (i = -cell.nucleus.range_radius; i < (cell.nucleus.range_radius + 1); i++) {
            var temp_range = [];
            var arr_start = (cell_location - cell.nucleus.range_radius) + (env.height * i);
            for (j = 0; j < cell.nucleus.range_diam; j++) {
                temp_range.push(arr_start + j);
            }
            range = range.concat(temp_range);
        }

        // Earth is round (cell.nucleus.range)
        for (i = 0; i < range.length; i++) {
            if (range[i] < 0) {
                range[i] = env.area + range[i];
            } else if (range[i] > (env.area - 1)) {
                range[i] = range[i] - env.area;
            }
        }
        return range;
    };

    cell.nucleus.range = cell.nucleus.findrange(cell.nucleus.location, cell.nucleus.prospective_range);

    cell.nucleus.findrange_outer = function() {
        var outer_range = new Object();
        
        var temp_arr_0 = cell.nucleus.range.slice(0, cell.nucleus.range_diam);
        for (i = 0; i < temp_arr_0.length; i++) {
            temp_arr_0[i] = temp_arr_0[i] - env.height;
        }
        outer_range[0] = temp_arr_0;
        
        var temp_arr_1 = [];
        for (i = 0; i < cell.nucleus.range_area; i += cell.nucleus.range_diam) {
            temp_arr_1.push(cell.nucleus.range[i] - 1);
        }
        outer_range[1] = temp_arr_1;
        
        var temp_arr_2 = [];
        for (i = cell.nucleus.range_diam - 1; i < cell.nucleus.range_area; i += cell.nucleus.range_diam) {
            temp_arr_2.push(cell.nucleus.range[i] + 1);
        }
        outer_range[2] = temp_arr_2;
        
        var temp_arr_3 = cell.nucleus.range.slice(cell.nucleus.range.indexOf(cell.nucleus.range[cell.nucleus.range_area - cell.nucleus.range_diam]));
        for (i = 0; i < temp_arr_3.length; i++) {
            temp_arr_3[i] = temp_arr_3[i] + env.height;
        }
        outer_range[3] = temp_arr_3;
        
        return outer_range;
    };




    cell.nucleus.move_left = function() {cell.nucleus.location = cell.nucleus.location - 1; cell.nucleus.calcmove();};
    cell.nucleus.move_right = function() {cell.nucleus.location = cell.nucleus.location + 1; cell.nucleus.calcmove();};
    cell.nucleus.move_up = function() {cell.nucleus.location = cell.nucleus.location - env.height; cell.nucleus.calcmove();};
    cell.nucleus.move_down = function() {cell.nucleus.location = cell.nucleus.location + env.height; cell.nucleus.calcmove();};
    cell.nucleus.calcmove = function() {

        // Earth is round (cell.nucleus.location)
        if (cell.nucleus.location < 0) {
            cell.nucleus.location = env.area + cell.nucleus.location;
        } else if (cell.nucleus.location > (env.area - 1)) {
            cell.nucleus.location = cell.nucleus.location - env.area;
        }

        $(".cell").removeClass("cell");
        $(".sqmeter").eq(cell.nucleus.location).addClass("cell");
        $(".range").removeClass("range");

        // add range to remembered
        cell.nucleus.pathmem_decay();

        cell.nucleus.range = cell.nucleus.findrange(cell.nucleus.location, cell.nucleus.prospective_range);
        for (i = 0; i < cell.nucleus.range.length; i++) {

            $(".sqmeter").eq(cell.nucleus.range[i]).addClass("range remembered");
            $(".range").data("ttl", cell.nucleus.pathmem);
        }
    };
    cell.nucleus.setWander = function() {setInterval(cell.nucleus.wander, cell.nucleus.wander_rate)};
    cell.nucleus.setWander_smart = function() {setInterval(cell.nucleus.wander_smart, cell.nucleus.wander_rate)};
    cell.nucleus.wanderLeft = function() {setInterval(cell.nucleus.move_left, cell.nucleus.wander_rate)};
        
    // hard-coded wanders for different internal cell states; realistically the behavior of these wanders would be
    // dynamically changed based on every internal state, as opposed to deterministic as "smart" and "simple";
    // In essence, the "Smart" should "become" the simple if certain detrimental internal states are reached.

    // random wander (simple)
    cell.nucleus.wander = function() {

        var move = Math.floor(Math.random() * 4) + 1;
        if (move == 1) {cell.nucleus.move_left()}
        else if (move == 2) {cell.nucleus.move_up()}
        else if (move == 3) {cell.nucleus.move_right()}
        else if (move == 4) {cell.nucleus.move_down()}
    };

    // smart wander (complex)
    cell.nucleus.wander_smart = function() {
        var bigarr = [];
        var arr = cell.nucleus.findrange_outer();
        var memcount_arr = [];
        for (var key in arr) {
            var memcount = 0;
            for (i = 0; i < arr[key].length; i++) {
                if ($(".sqmeter").eq(arr[key][i]).hasClass("remembered")) {
                    memcount++;
                }
            }
            memcount_arr.push(100 - Math.round(((memcount / arr[key].length) + 0.00001) * 100));
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
            if (move == 0) {cell.nucleus.move_up()}
            else if (move == 1) {cell.nucleus.move_left()}
            else if (move == 2) {cell.nucleus.move_right()}
            else if (move == 3) {cell.nucleus.move_down()}
        } else {
            var move = Math.floor(Math.random() * 4);
            if (move == 0) {cell.nucleus.move_up()}
            else if (move == 1) {cell.nucleus.move_left()}
            else if (move == 2) {cell.nucleus.move_right()}
            else if (move == 3) {cell.nucleus.move_down()}
        }
    };

    cell.nucleus.pathmem_decay = function() {
        $(".remembered").each(function() {
            var ttl = $(this).data("ttl") - 1;
            if (ttl >= 0) {
                $(this).data("ttl", ttl);
            }
            if (ttl == 0) {
                $(this).removeClass("remembered");
            }
        });
    };

    cell.nucleus.differentiate = function() {
        if (cell.stamina == 100) {
            env.cellcount++;
            cell.stamina /= 2;
        }
    };

$(window).on("load", function() {
    //instantiate_environment();
});


function instantiate_environment() { console.log("instantiate_environment");
    var rc = 0;
    var tr = "<tr id=\"" + rc + "\"></tr>";
    for (i = 0; i < env.area; i++) {
        if ($(tr).children("td").length == env.width) {
            $("#universe").append(tr);
            rc++;
            tr = "<tr id=\""+ rc +"\"></tr>";
        }
        var td = "<td id=\"" + i + "\" class=\"sqmeter\"></td>";
        
        // instantiate cell
        if ((i) == cell.nucleus.location) {
            td = $(td).addClass("cell");
        }
        
        // instantiate cell range
        if (cell.nucleus.range.includes(i)) {
            td = $(td).addClass("range remembered");
            $(td).data("ttl", cell.nucleus.pathmem);
        }
        
        tr = $(tr).append(td);
    }
    $("#universe").append(tr);
}

$(document).on("keydown", function(e) {
    if (e.keyCode == '38') {
        // up arrow
        cell.nucleus.move_up();
        cell.nucleus.wander_smart();
    }
    else if (e.keyCode == '40') {
        // down arrow
        cell.nucleus.move_down();
        cell.nucleus.wander_smart();
    }
    else if (e.keyCode == '37') {
       // left arrow
        cell.nucleus.move_left();
        cell.nucleus.wander_smart();
    }
    else if (e.keyCode == '39') {
       // right arrow
        cell.nucleus.move_right();
        cell.nucleus.wander_smart();
    }
});