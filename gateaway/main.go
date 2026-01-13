package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    // Créer une instance par défaut de Gin
    r := gin.Default()

    // Une route de test
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "pong",
        })
    })

    // Lancer le serveur sur le port 8080
    r.Run(":3001")
}
