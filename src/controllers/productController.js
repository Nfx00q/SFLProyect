const controller = {};

controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM producto', (err, productos) => {
            if(err){
                res.json(err);
            }
            console.log(productos)
            res.render('productos' , {
                data: productos
            })
        });
    });
};

module.exports = controller;