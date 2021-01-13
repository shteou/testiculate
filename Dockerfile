FROM golang:1.15 as builder

WORKDIR /go/src/github.com/ccycloud/testiculate

COPY go.mod .
COPY go.sum .

RUN go mod download

COPY cmd/ cmd

RUN go build -ldflags="-w -s" cmd/testiculate/testiculate.go

FROM busybox:glibc as production

COPY --from=builder /go/src/github.com/ccycloud/testiculate/testiculate /usr/bin/testiculate

CMD ["testiculate"]
