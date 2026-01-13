package com.example.fixhub.controller;

import com.example.fixhub.model.Connection;
import com.example.fixhub.service.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionsController {

    @Autowired
    private ConnectionService connectionService;
    @Autowired
    private com.example.fixhub.service.FixEngineService fixEngineService;

    @GetMapping
    public ResponseEntity<List<Connection>> list() {
        return ResponseEntity.ok(connectionService.findAll());
    }

    @PostMapping
    public ResponseEntity<Connection> create(@RequestBody Connection connection) {
        Connection created = connectionService.create(connection);
        // start acceptor for this connection if possible
        try {
            fixEngineService.startAcceptorForConnection(created);
        } catch (Exception e) {
            // log but don't fail create
        }
        return ResponseEntity.created(URI.create("/api/connections/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Connection> update(@PathVariable String id, @RequestBody Connection connection) {
        return connectionService.update(id, connection)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        boolean removed = connectionService.delete(id);
        if (removed) {
            // stop acceptor if it was running
            try { fixEngineService.stopAcceptorForConnectionId(id); } catch (Exception ignored) {}
        }
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
